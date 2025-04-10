const express = require('express');
const Incident = require('../models/Incident');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all incidents
router.get('/', auth, async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('reportedBy', 'username company')
      .populate('assignedTo', 'username')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent incidents for dashboard
router.get('/recent', auth, async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('reportedBy', 'username company')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new incident
router.post('/', auth, async (req, res) => {
  try {
    const incident = new Incident({
      ...req.body,
      reportedBy: req.user._id,
    });
    await incident.save();
    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update incident
router.patch('/:id', auth, async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get incident statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Incident.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0],
            },
          },
          highPriority: {
            $sum: {
              $cond: [{ $eq: ['$priority', 'High'] }, 1, 0],
            },
          },
        },
      },
    ]);

    const categoryStats = await Incident.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      overall: stats[0],
      categories: categoryStats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
