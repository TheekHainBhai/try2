const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [
      'consumer',
      'food-inspector',
      'establishment-owner',
      'health-official',
      'admin'
    ],
    default: 'consumer',
  },
  company: {
    type: String,
    required: true,
  },
  profile: {
    fullName: String,
    phone: String,
    designation: String,
    organization: String,
    credentials: [{
      type: {
        type: String,
        enum: [
          'food-safety-certification',
          'health-inspector-license',
          'business-license',
          'professional-certification',
          'other'
        ],
      },
      number: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
    }],
    expertise: [{
      type: String,
      enum: [
        'food-safety',
        'quality-control',
        'hygiene-management',
        'regulatory-compliance',
        'public-health',
        'other'
      ],
    }],
  },
  activityMetrics: {
    reportsSubmitted: {
      type: Number,
      default: 0,
    },
    reportsVerified: {
      type: Number,
      default: 0,
    },
    violationsReported: {
      type: Number,
      default: 0,
    },
    helpfulVotesReceived: {
      type: Number,
      default: 0,
    },
    trustScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
  },
  establishments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  watchlist: [{
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notifications: {
      violations: {
        type: Boolean,
        default: true,
      },
      reviews: {
        type: Boolean,
        default: true,
      },
      inspections: {
        type: Boolean,
        default: true,
      },
    },
  }],
  preferences: {
    emailNotifications: {
      violations: {
        type: Boolean,
        default: true,
      },
      reviews: {
        type: Boolean,
        default: true,
      },
      inspections: {
        type: Boolean,
        default: true,
      },
    },
    pushNotifications: {
      violations: {
        type: Boolean,
        default: true,
      },
      reviews: {
        type: Boolean,
        default: true,
      },
      inspections: {
        type: Boolean,
        default: true,
      },
    },
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending-verification', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Index for faster searches
userSchema.index({ username: 1, email: 1 });
userSchema.index({ 'profile.fullName': 'text' });
userSchema.index({ role: 1, status: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate trust score
userSchema.methods.updateTrustScore = async function() {
  const {
    reportsSubmitted,
    reportsVerified,
    violationsReported,
    helpfulVotesReceived
  } = this.activityMetrics;

  // Calculate trust score based on activity and verification ratio
  let score = 50; // Base score
  
  if (reportsSubmitted > 0) {
    const verificationRatio = reportsVerified / reportsSubmitted;
    score += verificationRatio * 20;
  }
  
  // Add points for helpful votes
  score += Math.min(helpfulVotesReceived * 0.5, 15);
  
  // Add points for violations that led to actions
  if (violationsReported > 0) {
    const actionRatio = reportsVerified / violationsReported;
    score += actionRatio * 15;
  }

  // Cap the score at 100
  this.activityMetrics.trustScore = Math.min(Math.round(score), 100);
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
