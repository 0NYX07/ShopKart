const express = require('express');
const router = express.Router();
const {
  getPaymentConfig,
  updatePaymentConfig,
  createPaymentOrder,
  verifyPayment,
  recordPaymentFailure,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

// Payment gateway configuration routes
router.get('/payment-config', getPaymentConfig);
router.post('/payment-config', protect, updatePaymentConfig);

// All order endpoints are protected by JWT authentication
router.post('/create-payment-order', protect, createPaymentOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/record-failure', protect, recordPaymentFailure);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, updateOrderStatus); // Bonus Challenge

module.exports = router;

