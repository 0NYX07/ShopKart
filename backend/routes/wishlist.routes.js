const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} = require('../controllers/wishlist.controller');

// All Wishlist API endpoints require authentication via protect middleware

// Route: POST /wishlist/:productId (Add product to current user's wishlist)
router.post('/:productId', protect, addToWishlist);

// Route: GET /wishlist (Get current authenticated user's wishlist with populated products)
router.get('/', protect, getWishlist);

// Route: DELETE /wishlist/:productId (Remove product from current user's wishlist)
router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;
