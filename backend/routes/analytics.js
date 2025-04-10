const express = require('express');
const Incident = require('../models/Incident');
const auth = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get overall stats
    const stats = await Incident.aggregate([
      {
        $group: {
          _id: null,
          totalIncidents: { $sum: 1 },
          activeComplaints: {
            $sum: {
              $cond: [
                { $in: ['$status', ['Open', 'Under Investigation']] },
                1,
                0,
              ],
            },
          },
          resolvedIssues: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0],
            },
          },
          avgResolutionTime: { $avg: '$resolutionTime' },
        },
      },
    ]);

    // Get category performance
    const categoryPerformance = await Incident.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          resolved: 1,
          performance: {
            $multiply: [{ $divide: ['$resolved', '$total'] }, 100],
          },
        },
      },
    ]);

    // Get issue distribution
    const issueDistribution = await Incident.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get top performers (companies with highest resolution rates)
    const topPerformers = await Incident.aggregate([
      {
        $group: {
          _id: '$company',
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          company: '$_id',
          total: 1,
          resolved: 1,
          resolutionRate: {
            $multiply: [{ $divide: ['$resolved', '$total'] }, 100],
          },
        },
      },
      { $sort: { resolutionRate: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      stats: stats[0],
      categoryPerformance,
      issueDistribution,
      topPerformers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get trend analysis
router.get('/trends', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await Incident.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
