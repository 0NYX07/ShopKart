const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate Product ID is a valid 24-character hexadecimal ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Validate product exists in Product collection
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Find authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    // 4. Check for duplicate wishlist entry
    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        statusCode: 409,
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // 5. Add product reference to user's wishlist array
    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error adding product to wishlist',
    });
  }
};

/**
 * @desc    Get current authenticated user's wishlist with populated product details
 * @route   GET /wishlist
 * @access  Private (Protected by JWT)
 */
const getWishlist = async (req, res) => {
  try {
    // Populate product references while excluding sensitive/unnecessary internal fields
    const user = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name description price category image stock createdAt',
    });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    // Filter out potential orphaned references (if a product was removed from database)
    const validWishlist = (user.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error fetching wishlist',
    });
  }
};

/**
 * @desc    Remove product from authenticated user's wishlist
 * @route   DELETE /wishlist/:productId
 * @access  Private (Protected by JWT)
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate Product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Find authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    // 3. Check if the product is actually in the user's wishlist
    const exists = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (!exists) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // 4. Remove reference from array and save
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
    await user.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error removing product from wishlist',
    });
  }
};

/**
 * @desc    Toggle product in wishlist (Bonus Feature: +10 Marks)
 * @route   PATCH /wishlist/:productId/toggle
 * @access  Private (Protected by JWT)
 */
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid product ID',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (isAlreadyWishlisted) {
      // Remove product
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId.toString()
      );
      await user.save();

      return res.status(200).json({
        statusCode: 200,
        success: true,
        saved: false,
        message: 'Product removed from wishlist',
      });
    } else {
      // Check product existence before adding
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          statusCode: 404,
          success: false,
          message: 'Product not found',
        });
      }

      user.wishlist.push(productId);
      await user.save();

      return res.status(200).json({
        statusCode: 200,
        success: true,
        saved: true,
        message: 'Product added to wishlist',
      });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error toggling wishlist',
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
