const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Beverages', 'Packaged Goods', 'Dairy', 'Other']
  },
  issueType: {
    type: String,
    required: true,
    enum: ['Quality Issue', 'Safety Concern', 'Labeling Issue', 'Packaging Defect', 'Other']
  },
  description: {
    type: String,
    required: true,
    minlength: 20
  },
  evidenceFiles: [{
    filename: String,
    path: String,
    mimetype: String
  }],
  fssaiNumber: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
complaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
