const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require('../controllers/wishlist.controller');
const { protect } = require('../middlewares/auth.middleware');

// GET /wishlist - Get current authenticated user's wishlist
router.get('/', protect, getWishlist);

// POST /wishlist/:productId - Add product to wishlist
// DELETE /wishlist/:productId - Remove product from wishlist
router
  .route('/:productId')
  .post(protect, addToWishlist)
  .delete(protect, removeFromWishlist);

// PATCH /wishlist/:productId/toggle - Bonus: Toggle wishlist status
router.patch('/:productId/toggle', protect, toggleWishlist);
router.post('/:productId/toggle', protect, toggleWishlist);

module.exports = router;
