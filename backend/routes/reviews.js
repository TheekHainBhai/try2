const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const Product = require('../models/Product');

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      rating,
    } = req.query;

    const query = { 
      product: req.params.productId,
      status: 'approved'
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username avatar')
      .select('-moderationNotes -reportCount');

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalReviews: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top reviews for a product
router.get('/product/:productId/top', async (req, res) => {
  try {
    const reviews = await Review.getTopReviews(req.params.productId);
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reviews
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name category images')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a review
router.post('/', auth, async (req, res) => {
  try {
    const {
      productId,
      rating,
      title,
      comment,
      pros,
      cons,
      images,
      purchaseVerified
    } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      product: productId,
      user: req.user.id,
      rating,
      title,
      comment,
      pros,
      cons,
      images,
      purchaseVerified,
      status: 'pending' // All reviews start as pending for moderation
    });

    await review.save();

    // Populate user data before sending response
    await review.populate('user', 'username avatar');

    res.status(201).json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a review
router.put('/:id', auth, async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check review ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update only allowed fields
    const {
      rating,
      title,
      comment,
      pros,
      cons,
      images
    } = req.body;

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.pros = pros || review.pros;
    review.cons = cons || review.cons;
    review.images = images || review.images;
    review.status = 'pending'; // Reset to pending for re-moderation

    await review.save();
    await review.populate('user', 'username avatar');

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check review ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await review.remove();
    res.json({ message: 'Review removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote review as helpful
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.toggleHelpfulVote();
    res.json({ helpfulVotes: review.helpfulVotes });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report a review
router.post('/:id/report', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.reportCount += 1;
    if (review.reportCount >= 5) {
      review.status = 'flagged';
    }
    await review.save();

    res.json({ message: 'Review reported' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
