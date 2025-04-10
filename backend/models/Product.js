const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  fssaiLicense: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    enum: [
      'packaged-foods',
      'beverages',
      'dairy-products',
      'meat-products',
      'bakery',
      'ready-to-eat',
      'health-supplements',
      'street-food',
      'restaurant',
      'other'
    ],
    required: true,
  },
  establishment: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'restaurant',
        'manufacturer',
        'processor',
        'distributor',
        'retailer',
        'street-vendor',
        'other'
      ],
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    contactNumber: String,
  },
  regulatoryCompliance: {
    fssaiExpiryDate: {
      type: Date,
      required: true,
    },
    lastInspectionDate: Date,
    inspectionRating: {
      type: Number,
      min: 0,
      max: 5,
    },
    certifications: [{
      name: String,
      issuedDate: Date,
      expiryDate: Date,
      issuingAuthority: String,
    }],
    violations: [{
      date: Date,
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
      },
      status: {
        type: String,
        enum: ['pending', 'resolved', 'under-review'],
      },
    }],
  },
  qualityMetrics: {
    hygieneRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    safetyRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    qualityRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reportedIssues: {
      type: Number,
      default: 0,
    },
    resolvedIssues: {
      type: Number,
      default: 0,
    },
  },
  foodSafety: {
    storageInstructions: String,
    allergenInfo: [String],
    ingredients: [String],
    nutritionalInfo: {
      servingSize: String,
      calories: Number,
      proteins: Number,
      carbohydrates: Number,
      fats: Number,
      vitamins: [String],
      minerals: [String],
    },
    shelfLife: {
      manufacturingDate: Date,
      expiryDate: Date,
      bestBefore: Date,
    },
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'blacklisted', 'under-investigation'],
    default: 'active',
  },
  images: [{
    url: String,
    type: {
      type: String,
      enum: ['product', 'establishment', 'certification', 'violation'],
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for faster searches
productSchema.index({ name: 'text', 'establishment.name': 'text' });
productSchema.index({ fssaiLicense: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });

// Virtual for calculating overall rating
productSchema.virtual('overallRating').get(function() {
  const { hygieneRating, safetyRating, qualityRating } = this.qualityMetrics;
  const total = hygieneRating + safetyRating + qualityRating;
  return total / 3;
});

// Method to check if FSSAI license is expired
productSchema.methods.isFssaiExpired = function() {
  return this.regulatoryCompliance.fssaiExpiryDate < new Date();
};

// Method to add violation
productSchema.methods.addViolation = async function(violation) {
  this.regulatoryCompliance.violations.push(violation);
  if (violation.severity === 'critical') {
    this.status = 'under-investigation';
  }
  await this.save();
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
