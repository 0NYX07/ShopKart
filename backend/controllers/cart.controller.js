const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * @desc    Add product to cart or increment quantity if already present
 * @route   POST /cart/:productId
 * @access  Private (Protected by JWT)
 */
const addToCart = async (req, res) => {
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

    // 2. Validate product exists in catalog
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

    // Determine quantity to add (default to 1, or accept positive integer if provided)
    let quantityToAdd = 1;
    if (
      req.body &&
      typeof req.body.quantity === 'number' &&
      Number.isInteger(req.body.quantity) &&
      req.body.quantity > 0
    ) {
      quantityToAdd = req.body.quantity;
    }

    // 4. Check if product is already in user's cart
    const existingIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingIndex > -1) {
      // Product is already in cart -> increment quantity
      const newQuantity = user.cart[existingIndex].quantity + quantityToAdd;

      // Validate against available stock
      if (newQuantity > product.stock) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: `Cannot add more. Requested quantity (${newQuantity}) exceeds available stock (${product.stock}).`,
        });
      }

      user.cart[existingIndex].quantity = newQuantity;
    } else {
      // Product not in cart -> add as new entry with initial quantity
      if (product.stock < 1) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: 'Product is currently out of stock.',
        });
      }

      if (quantityToAdd > product.stock) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: `Requested quantity (${quantityToAdd}) exceeds available stock (${product.stock}).`,
        });
      }

      user.cart.push({
        product: productId,
        quantity: quantityToAdd,
      });
    }

    // 5. Save user document
    await user.save();

    // 6. Populate cart product details
    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Cart updated',
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error adding product to cart',
    });
  }
};

/**
 * @desc    Get current authenticated user's cart with populated product details
 * @route   GET /cart
 * @access  Private (Protected by JWT)
 */
const getCart = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    // Filter out potential orphaned references (e.g. if a product was deleted)
    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      count: validCart.length,
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error fetching cart',
    });
  }
};

/**
 * @desc    Update quantity of a product in the cart
 * @route   PATCH /cart/:productId
 * @access  Private (Protected by JWT)
 */
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate Product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Validate quantity parameter
    if (quantity === undefined || quantity === null || typeof quantity !== 'number' || isNaN(quantity)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Quantity must be a valid number',
      });
    }

    const parsedQuantity = Math.floor(quantity);
    if (parsedQuantity < 1) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // 3. Validate product exists in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Product not found',
      });
    }

    // 4. Validate quantity against available stock
    if (parsedQuantity > product.stock) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: `Quantity exceeds available stock (${product.stock})`,
      });
    }

    // 5. Find authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    // 6. Check if product is in user's cart
    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (!cartItem) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Product not in cart',
      });
    }

    // 7. Update quantity and save
    cartItem.quantity = parsedQuantity;
    await user.save();

    // 8. Return populated cart
    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Cart quantity updated',
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error updating cart quantity',
    });
  }
};

/**
 * @desc    Remove product from authenticated user's cart
 * @route   DELETE /cart/:productId
 * @access  Private (Protected by JWT)
 */
const removeFromCart = async (req, res) => {
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

    // 3. Check if product is in cart
    const exists = user.cart.some(
      (item) => item.product.toString() === productId.toString()
    );

    if (!exists) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Product not in cart',
      });
    }

    // 4. Remove item from cart array and save
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId.toString()
    );
    await user.save();

    // 5. Return populated cart
    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Product removed from cart',
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error removing product from cart',
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};
