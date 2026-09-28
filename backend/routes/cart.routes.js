const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
} = require('../controllers/cart.controller');

// All Cart endpoints require authentication via protect middleware

// Route: POST /cart/:productId (Add product to cart or increment quantity)
router.post('/:productId', protect, addToCart);

// Route: GET /cart (Get current authenticated user's cart with populated product details)
router.get('/', protect, getCart);

// Route: PATCH /cart/:productId (Update cart item quantity)
router.patch('/:productId', protect, updateCartQuantity);

// Route: DELETE /cart/:productId (Remove product from cart)
router.delete('/:productId', protect, removeFromCart);

module.exports = router;
