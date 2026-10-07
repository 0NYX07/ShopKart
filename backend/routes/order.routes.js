const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
    createOrder,
    createPaymentOrder,
    verifyPayment,
    getMyOrders,
    getOrderById,
    markPaymentFailed,
    retryPayment
} = require('../controllers/order.controller');

// All order endpoints require authentication via protect middleware

// Route: GET /orders (Retrieve all orders belonging to authenticated user - Step 9)
router.get('/', protect, getMyOrders);

// Route: GET /orders/:id (Retrieve specific order belonging to authenticated user - Step 10)
router.get('/:id', protect, getOrderById);

// Route: POST /orders (Direct order creation)
router.post('/', protect, createOrder);

// Route: POST /orders/create-payment-order (Razorpay payment order creation for Lab 06)
router.post('/create-payment-order', protect, createPaymentOrder);

// Route: POST /orders/verify-payment (Razorpay payment signature verification for Lab 06)
router.post('/verify-payment', protect, verifyPayment);

// Route: POST /orders/payment-failed (Mark order payment as failed)
router.post('/payment-failed', protect, markPaymentFailed);

// Route: POST /orders/:id/retry-payment (Retry payment for pending/failed order)
router.post('/:id/retry-payment', protect, retryPayment);

module.exports = router;

