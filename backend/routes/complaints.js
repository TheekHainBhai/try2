const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Incident = require('../models/Incident');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/complaints')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  }
});

// Submit a new complaint
router.post('/', auth, upload.array('evidenceFiles', 5), async (req, res) => {
  try {
    console.log('Received complaint submission:', req.body);
    console.log('Authenticated user:', req.user);
    
    const {
      productName,
      batchNumber,
      purchaseDate,
      category,
      issueType,
      description,
      fssaiNumber
    } = req.body;

    // Validate required fields
    if (!productName || !category || !issueType || !description) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['productName', 'category', 'issueType', 'description'],
        received: { productName, category, issueType, description }
      });
    }

    const evidenceFiles = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype
    })) : [];

    console.log('Creating complaint with files:', evidenceFiles);

    const complaint = new Complaint({
      userId: req.user.id,
      productName,
      batchNumber,
      purchaseDate,
      category,
      issueType,
      description,
      evidenceFiles,
      fssaiNumber
    });

    await complaint.save();
    console.log('Complaint saved:', complaint);

    // Create a corresponding incident
    const incident = new Incident({
      product: productName,
      company: req.user.company || 'Unknown Company', // Using user's company from auth with fallback
      description: description,
      priority: 'Medium', // Default priority
      category: category,
      reportedBy: req.user.id,
      status: 'Open'
    });

    await incident.save();
    console.log('Incident created:', incident);

    res.status(201).json({ complaint, incident });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      message: 'Error submitting complaint',
      error: error.message,
      details: error.stack
    });
  }
});

// Get all complaints for the current user
router.get('/my-complaints', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints', error: error.message });
  }
});

// Get a specific complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    if (complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaint', error: error.message });
  }
});

module.exports = router;
