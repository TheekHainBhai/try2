const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');

// Get all products with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};
    
    // Apply filters
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProducts: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      fssaiLicense,
      category,
      description,
      manufacturer,
      batchNumber,
      manufacturingDate,
      expiryDate,
      ingredients,
      nutritionalInfo,
      packaging,
      weightPerUnit,
      images
    } = req.body;

    const product = new Product({
      name,
      fssaiLicense,
      category,
      description,
      manufacturer,
      batchNumber,
      manufacturingDate,
      expiryDate,
      ingredients,
      nutritionalInfo,
      packaging,
      weightPerUnit,
      images
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'FSSAI License already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'FSSAI License already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify FSSAI license
router.get('/verify/:fssaiLicense', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      fssaiLicense: req.params.fssaiLicense 
    });
    
    if (!product) {
      return res.status(404).json({ 
        verified: false,
        message: 'Product not found with this FSSAI license' 
      });
    }

    res.json({
      verified: true,
      product: {
        name: product.name,
        manufacturer: product.manufacturer,
        category: product.category,
        fssaiLicense: product.fssaiLicense
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
