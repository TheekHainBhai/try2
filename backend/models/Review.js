const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ratings: {
    hygiene: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    safety: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    quality: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  review: {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  foodSafetyObservations: {
    storageConditions: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    },
    handlingPractices: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    },
    packagingCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    },
    temperature: {
      type: String,
      enum: ['appropriate', 'inappropriate', 'not-applicable'],
    },
    comments: String,
  },
  hygieneIssues: [{
    type: {
      type: String,
      enum: [
        'cleanliness',
        'pest-control',
        'staff-hygiene',
        'equipment-sanitation',
        'waste-management',
        'other'
      ],
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    description: String,
    location: String,
  }],
  complianceViolations: [{
    type: {
      type: String,
      enum: [
        'expired-license',
        'improper-labeling',
        'unauthorized-additives',
        'misbranded-product',
        'false-claims',
        'other'
      ],
    },
    description: String,
    evidence: String,
  }],
  qualityIssues: [{
    type: {
      type: String,
      enum: [
        'taste',
        'appearance',
        'texture',
        'freshness',
        'foreign-objects',
        'packaging',
        'other'
      ],
    },
    description: String,
    batchNumber: String,
  }],
  images: [{
    url: String,
    type: {
      type: String,
      enum: ['hygiene', 'safety', 'quality', 'violation', 'general'],
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'disputed', 'false-report'],
    default: 'pending',
  },
  reportOutcome: {
    status: {
      type: String,
      enum: ['open', 'under-investigation', 'resolved', 'dismissed'],
      default: 'open',
    },
    actionTaken: String,
    resolutionDate: Date,
    authorityResponse: String,
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
  reportFlags: [{
    type: String,
    enum: ['spam', 'inappropriate', 'false-information', 'harassment', 'other'],
  }],
}, {
  timestamps: true,
});

// Compound index for unique reviews per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for faster searches
reviewSchema.index({ 
  'verificationStatus': 1,
  'reportOutcome.status': 1,
  createdAt: -1 
});

// Virtual for calculating overall rating
reviewSchema.virtual('overallRating').get(function() {
  const { hygiene, safety, quality } = this.ratings;
  return (hygiene + safety + quality) / 3;
});

// Pre-save middleware to update product metrics
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    
    if (product) {
      // Update quality metrics
      product.qualityMetrics.hygieneRating = 
        (product.qualityMetrics.hygieneRating * product.qualityMetrics.reportedIssues + this.ratings.hygiene) / 
        (product.qualityMetrics.reportedIssues + 1);
      
      product.qualityMetrics.safetyRating = 
        (product.qualityMetrics.safetyRating * product.qualityMetrics.reportedIssues + this.ratings.safety) / 
        (product.qualityMetrics.reportedIssues + 1);
      
      product.qualityMetrics.qualityRating = 
        (product.qualityMetrics.qualityRating * product.qualityMetrics.reportedIssues + this.ratings.quality) / 
        (product.qualityMetrics.reportedIssues + 1);
      
      product.qualityMetrics.reportedIssues += 1;
      
      // Check for critical issues
      const hasCriticalIssues = this.hygieneIssues.some(issue => issue.severity === 'critical') ||
        this.foodSafetyObservations.storageConditions === 'critical' ||
        this.foodSafetyObservations.handlingPractices === 'critical';
      
      if (hasCriticalIssues) {
        product.status = 'under-investigation';
      }
      
      await product.save();
    }
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
