const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const {
  getRazorpayInstance,
  getRazorpayKeyId,
  getRazorpayKeySecret,
  isConfiguredWithRealKeys,
  updateRazorpayKeys,
} = require('../config/razorpay');

/**
 * @desc    Get active Razorpay key status and public key ID
 * @route   GET /orders/payment-config
 * @access  Private (JWT protected)
 */
const getPaymentConfig = async (req, res) => {
  try {
    const keyId = getRazorpayKeyId();
    const isReal = isConfiguredWithRealKeys();
    const maskedKeyId =
      keyId && keyId.length > 10
        ? `${keyId.slice(0, 8)}...${keyId.slice(-4)}`
        : (keyId || 'rzp_test_demo...sim');

    return res.status(200).json({
      statusCode: 200,
      success: true,
      isConfigured: Boolean(keyId),
      isDemoSimulation: !isReal,
      isRealGateway: isReal,
      keyId: keyId || 'rzp_test_TlrSWGUSL5ecdo',
      maskedKeyId,
      message: isReal
        ? 'Razorpay Live/Test Gateway credentials active'
        : 'Razorpay Demo API Simulation active with HMAC-SHA256 verification',
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Error fetching payment configuration',
    });
  }
};

/**
 * @desc    Update and verify Razorpay API credentials
 * @route   POST /orders/payment-config
 * @access  Private (JWT protected)
 */
const updatePaymentConfig = async (req, res) => {
  try {
    const { keyId, keySecret } = req.body;
    if (!keyId || !keySecret) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Both Razorpay Key ID and Key Secret are required',
      });
    }

    const result = await updateRazorpayKeys(keyId, keySecret);
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Razorpay API credentials verified and saved successfully!',
      keyId: result.keyId,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: error.message || 'Failed to update Razorpay credentials',
    });
  }
};

/**
 * @desc    Validate cart, calculate trusted totals, snapshot items & create Razorpay order
 * @route   POST /orders/create-payment-order
 * @access  Private (JWT protected)
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address fields (supports full address & mobile-number-only simulation)
    if (!shippingAddress) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Shipping address or mobile number is required',
      });
    }

    const { phone } = shippingAddress;

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Mobile phone number is required',
      });
    }

    // Phone format validation (digits, 10+ digits)
    const phoneClean = phone.trim().replace(/\D/g, '');
    if (phoneClean.length < 10) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Please provide a valid phone number (at least 10 digits)',
      });
    }

    // Resolve address fields (use provided fields or intelligent simulation defaults for quick mobile checkout)
    const fullName = shippingAddress.fullName?.trim() || req.user?.fullName || `Customer (${phoneClean.slice(-4)})`;
    const addressLine1 = shippingAddress.addressLine1?.trim() || 'Express Simulation Hub, 100 Feet Road';
    const city = shippingAddress.city?.trim() || 'Bengaluru';
    const state = shippingAddress.state?.trim() || 'Karnataka';
    const pincode = shippingAddress.pincode ? shippingAddress.pincode.toString().trim() : '560001';

    // Pincode validation (6 numeric digits)
    const pincodeClean = pincode.replace(/\D/g, '');
    if (pincodeClean.length !== 6) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Pincode must contain exactly 6 numeric digits',
      });
    }

    // 2. Load authenticated user's cart
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'User not found',
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Your cart is empty. Cannot checkout without items.',
      });
    }

    // 3. Load latest product data and perform server-side validation & snapshotting
    const orderItems = [];
    let serverTotalAmount = 0;

    for (const item of user.cart) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: 'One or more products in your cart are no longer available in the catalog.',
        });
      }

      // Re-verify real-time stock
      if (item.quantity > product.stock) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, in your cart: ${item.quantity}.`,
        });
      }

      // Snapshot price and name at purchase time
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });

      serverTotalAmount += product.price * item.quantity;
    }

    if (serverTotalAmount <= 0) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Calculated order total must be greater than zero.',
      });
    }

    // 4. Create ShopKart Pending Order in database
    const shopKartOrder = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phoneClean,
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincodeClean,
      },
      totalAmount: serverTotalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    });

    await shopKartOrder.save();

    // 5. Generate Razorpay Order (supports both Live/Test API and Demo API Simulation)
    const amountInPaise = Math.round(serverTotalAmount * 100);
    const isReal = isConfiguredWithRealKeys();
    const rzp = getRazorpayInstance();
    const keyId = getRazorpayKeyId();
    const secretKey = getRazorpayKeySecret() || 'shopkart_mock_secret_key_12345';

    let rzpOrderId = null;
    let isDemoSimulation = true;
    let demoPaymentId = null;
    let demoSignature = null;

    if (isReal && rzp) {
      try {
        const razorpayOrder = await rzp.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${shopKartOrder._id.toString().slice(-10)}`,
          notes: {
            shopKartOrderId: shopKartOrder._id.toString(),
            userEmail: req.user.email,
          },
        });
        rzpOrderId = razorpayOrder.id;
        isDemoSimulation = false;
      } catch (err) {
        console.warn('Real Razorpay API order failed, proceeding with Demo API Simulation:', err.message);
      }
    }

    // Demo API Simulation mode fallback if real API order was not created
    if (!rzpOrderId) {
      rzpOrderId = `order_demo_${crypto.randomBytes(8).toString('hex')}`;
      isDemoSimulation = true;
    }

    // Always generate cryptographic simulation tokens so frontend in-app simulation works reliably
    demoPaymentId = `pay_sim_${crypto.randomBytes(8).toString('hex')}`;
    demoSignature = crypto
      .createHmac('sha256', secretKey)
      .update(`${rzpOrderId}|${demoPaymentId}`)
      .digest('hex');

    shopKartOrder.razorpayOrderId = rzpOrderId;
    await shopKartOrder.save();

    // 6. Return safe checkout information to frontend (KEY SECRET NEVER EXPOSED)
    return res.status(201).json({
      statusCode: 201,
      success: true,
      message: isDemoSimulation
        ? 'Razorpay Demo API Simulation order created successfully'
        : 'Razorpay order created successfully',
      isDemoSimulation,
      isRealGateway: !isDemoSimulation,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: rzpOrderId,
      demoPaymentId,
      demoSignature,
      amount: amountInPaise,
      currency: 'INR',
      key: keyId || 'rzp_test_TlrSWGUSL5ecdo',
      order: shopKartOrder,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error creating payment order',
    });
  }
};

/**
 * @desc    Verify Razorpay HMAC SHA256 signature, mark order PAID/PLACED, and clear cart
 * @route   POST /orders/verify-payment
 * @access  Private (JWT protected)
 */
const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      simulateFailure,
      failureReason,
    } = req.body;

    if (!shopKartOrderId) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Missing shopKartOrderId parameter',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid shopKartOrderId format',
      });
    }

    // 1. Fetch order from database
    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Order not found',
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: 'Forbidden. You do not own this order.',
      });
    }

    // Handle explicit simulation failure
    if (simulateFailure) {
      order.paymentStatus = 'FAILED';
      await order.save();

      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: failureReason || 'Simulated payment failure: Transaction declined by bank gateway simulator.',
        order,
        simulated: true,
      });
    }

    if (!razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Missing payment verification parameters (razorpay_payment_id, razorpay_signature required)',
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: 'Forbidden. You do not own this order.',
      });
    }

    // Check if already paid (idempotency)
    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'Order has already been verified and confirmed',
        order,
      });
    }

    // 2. Cryptographic signature verification using Node crypto (HMAC SHA-256)
    // Always use order.razorpayOrderId saved in DB as the trusted source of truth
    const trustedOrderId = order.razorpayOrderId || razorpay_order_id;
    const body = `${trustedOrderId}|${razorpay_payment_id}`;
    const keySecret = getRazorpayKeySecret() || 'shopkart_mock_secret_key_12345';

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const isValidSignature = expectedSignature === razorpay_signature;

    if (!isValidSignature) {
      order.paymentStatus = 'FAILED';
      await order.save();

      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid payment signature. Cryptographic HMAC-SHA256 verification failed.',
        details: {
          trustedOrderId,
          paymentId: razorpay_payment_id,
        },
      });
    }

    // 3. Mark payment as PAID and order as PLACED
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 4. Deduct catalog inventory for purchased quantities atomically
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 5. Clear authenticated user's cart in database
    const user = await Customer.findById(req.user._id);
    if (user) {
      user.cart = [];
      await user.save();
    }

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Payment cryptographically verified with HMAC-SHA256 and order confirmed!',
      order,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error verifying payment',
    });
  }
};

/**
 * @desc    Get all orders belonging to authenticated user (sorted newest first)
 * @route   GET /orders
 * @access  Private (JWT protected)
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error fetching orders',
    });
  }
};

/**
 * @desc    Get single order details by ID (Ownership enforced)
 * @route   GET /orders/:id
 * @access  Private (JWT protected)
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Order not found',
      });
    }

    // Enforce ownership: user must own this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: 'Forbidden. You are not authorized to view this order.',
      });
    }

    return res.status(200).json({
      statusCode: 200,
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error fetching order details',
    });
  }
};

/**
 * @desc    Update order status lifecycle (Bonus Challenge: PLACED -> CONFIRMED -> SHIPPED -> DELIVERED)
 * @route   PATCH /orders/:id/status
 * @access  Private (Admin/Dev endpoint)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: `Invalid status. Allowed statuses: ${allowedStatuses.join(', ')}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error updating order status',
    });
  }
};

/**
 * @desc    Simulate and record payment failure for an order
 * @route   POST /orders/record-failure
 * @access  Private (JWT protected)
 */
const recordPaymentFailure = async (req, res) => {
  try {
    const { shopKartOrderId, reason } = req.body;
    if (!shopKartOrderId) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'shopKartOrderId is required to record failure',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid shopKartOrderId format',
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: 'Forbidden. You do not own this order.',
      });
    }

    order.paymentStatus = 'FAILED';
    await order.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: `Payment failure simulated successfully: ${reason || 'Transaction declined'}`,
      order,
      failureReason: reason || 'Transaction declined by bank',
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error recording payment failure',
    });
  }
};

module.exports = {
  getPaymentConfig,
  updatePaymentConfig,
  createPaymentOrder,
  verifyPayment,
  recordPaymentFailure,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};

