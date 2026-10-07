const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * Validates shipping address payload fields.
 */
const validateShippingAddress = (shipping) => {
    if (!shipping || typeof shipping !== 'object') {
        return { error: 'Shipping address is required' };
    }

    const fullName = shipping.fullName ? String(shipping.fullName).trim() : '';
    const phone = shipping.phone ? String(shipping.phone).trim() : '';
    const address = shipping.address ? String(shipping.address).trim() : '';
    const city = shipping.city ? String(shipping.city).trim() : '';
    const state = shipping.state ? String(shipping.state).trim() : '';
    const pincode = shipping.pincode ? String(shipping.pincode).trim() : '';

    if (!fullName || !phone || !address || !city || !state || !pincode) {
        return {
            error: 'All shipping address fields (fullName, phone, address, city, state, pincode) are required'
        };
    }

    return {
        shippingAddress: {
            fullName,
            phone,
            address,
            city,
            state,
            pincode
        }
    };
};

/**
 * Validates cart items against live database records and calculates order total.
 */
const validateCartAndBuildItems = async (cart) => {
    if (!cart || cart.length === 0) {
        return {
            error: 'Your cart is empty. Please add items before placing an order.',
            statusCode: 400
        };
    }

    const orderItems = [];
    let calculatedTotal = 0;

    for (const cartItem of cart) {
        if (!cartItem.product) {
            return {
                error: 'Cart contains an invalid product reference',
                statusCode: 400
            };
        }

        const product = await Product.findById(cartItem.product);
        if (!product) {
            return {
                error: 'One or more products in your cart are no longer available',
                statusCode: 404
            };
        }

        const requestedQuantity = Number(cartItem.quantity);
        if (!requestedQuantity || requestedQuantity < 1) {
            return {
                error: `Invalid quantity for product "${product.name}"`,
                statusCode: 400
            };
        }

        if (requestedQuantity > product.stock) {
            return {
                error: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${requestedQuantity}`,
                statusCode: 400
            };
        }

        const itemPrice = Number(product.price);
        calculatedTotal += itemPrice * requestedQuantity;

        orderItems.push({
            product: product._id,
            name: product.name,
            price: itemPrice,
            quantity: requestedQuantity
        });
    }

    const finalTotal = Math.round((calculatedTotal + Number.EPSILON) * 100) / 100;

    return {
        orderItems,
        totalAmount: finalTotal
    };
};

/**
 * Controller to create a persistent order directly from the authenticated user's cart (Step 2).
 */
const createOrder = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const shippingResult = validateShippingAddress(req.body.shippingAddress || req.body);
        if (shippingResult.error) {
            return res.status(400).json({
                success: false,
                message: shippingResult.error
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const cartResult = await validateCartAndBuildItems(customer.cart);
        if (cartResult.error) {
            return res.status(cartResult.statusCode || 400).json({
                success: false,
                message: cartResult.error
            });
        }

        const order = await Order.create({
            user: customer._id,
            items: cartResult.orderItems,
            shippingAddress: shippingResult.shippingAddress,
            totalAmount: cartResult.totalAmount,
            paymentStatus: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while creating order'
        });
    }
};

/**
 * Controller to create a ShopKart Order and initiate a Razorpay payment order in Test Mode (Step 4).
 * POST /orders/create-payment-order
 */
const createPaymentOrder = async (req, res) => {
    let createdOrder = null;

    try {
        // 1. Verify authenticated user
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // 2. Validate shipping address from request
        const shippingResult = validateShippingAddress(req.body.shippingAddress || req.body);
        if (shippingResult.error) {
            return res.status(400).json({
                success: false,
                message: shippingResult.error
            });
        }

        // 3. Retrieve user and validate cart against live database records
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const cartResult = await validateCartAndBuildItems(customer.cart);
        if (cartResult.error) {
            return res.status(cartResult.statusCode || 400).json({
                success: false,
                message: cartResult.error
            });
        }

        // 4. Create persistent ShopKart Order with status 'pending'
        createdOrder = await Order.create({
            user: customer._id,
            items: cartResult.orderItems,
            shippingAddress: shippingResult.shippingAddress,
            totalAmount: cartResult.totalAmount,
            paymentStatus: 'pending'
        });

        // 5. Load Razorpay client configuration
        let razorpay;
        try {
            razorpay = require('../config/razorpay');
        } catch (configError) {
            // Roll back the just-created pending order if Razorpay is not configured
            if (createdOrder && createdOrder._id) {
                await Order.findByIdAndDelete(createdOrder._id);
                createdOrder = null;
            }
            return res.status(500).json({
                success: false,
                message: 'Payment gateway configuration error. Razorpay is not configured on the server.'
            });
        }

        // 6. Convert server-calculated amount in INR to paise (₹1 = 100 paise)
        const amountInPaise = Math.round(cartResult.totalAmount * 100);

        // 7. Create Razorpay order
        let razorpayOrder;
        try {
            const razorpayOptions = {
                amount: amountInPaise,
                currency: 'INR',
                receipt: `rcpt_${createdOrder._id}`
            };
            razorpayOrder = await razorpay.orders.create(razorpayOptions);
        } catch (razorpayError) {
            // Roll back the just-created pending order so no orphan order remains
            if (createdOrder && createdOrder._id) {
                await Order.findByIdAndDelete(createdOrder._id);
                createdOrder = null;
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to create Razorpay payment order'
            });
        }

        // 8. Save Razorpay Order ID into the ShopKart Order
        createdOrder.razorpayOrderId = razorpayOrder.id;
        await createdOrder.save();

        // 9. Send response with only required checkout details (never expose secret)
        return res.status(200).json({
            success: true,
            message: 'Payment order created successfully',
            orderId: createdOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        // Clean up order if created before error occurred
        if (createdOrder && createdOrder._id) {
            try {
                await Order.findByIdAndDelete(createdOrder._id);
            } catch (cleanupError) {
                // Ignore cleanup error
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while creating payment order'
        });
    }
};

/**
 * Controller to cryptographically verify Razorpay payment and mark order as paid (Step 5).
 * POST /orders/verify-payment
 */
const verifyPayment = async (req, res) => {
    try {
        // 1. Verify authenticated user
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const userId = req.user._id.toString();

        // 2. Extract verification data from request body
        const orderId = req.body.orderId || req.body.order_id;
        const razorpayOrderId = req.body.razorpay_order_id || req.body.razorpayOrderId;
        const razorpayPaymentId = req.body.razorpay_payment_id || req.body.razorpayPaymentId;
        const razorpaySignature = req.body.razorpay_signature || req.body.razorpaySignature;

        if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: 'All payment verification details (orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature) are required.'
            });
        }

        // 3. Validate ShopKart order ID format and find order in MongoDB
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format.'
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        // 4. Authorize order ownership - verify order belongs to authenticated user
        if (order.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to verify this order.'
            });
        }

        // 5. Verify Razorpay Order ID matches the stored order's razorpayOrderId
        if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
            return res.status(400).json({
                success: false,
                message: 'Razorpay order ID does not match this ShopKart order.'
            });
        }

        // 6. Cryptographically verify Razorpay signature using HMAC SHA-256
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return res.status(500).json({
                success: false,
                message: 'Payment gateway configuration error. Razorpay secret is not configured.'
            });
        }

        const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');

        let isSignatureValid = false;
        try {
            const generatedBuffer = Buffer.from(generatedSignature, 'utf8');
            const signatureBuffer = Buffer.from(razorpaySignature, 'utf8');
            if (generatedBuffer.length === signatureBuffer.length) {
                isSignatureValid = crypto.timingSafeEqual(generatedBuffer, signatureBuffer);
            }
        } catch (err) {
            isSignatureValid = false;
        }

        if (!isSignatureValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature. Verification failed.'
            });
        }

        // 7. Handle idempotency: if order is already marked as paid, return safely without deducting stock again
        if (order.paymentStatus === 'paid') {
            return res.status(200).json({
                success: true,
                message: 'Payment already verified successfully',
                order
            });
        }

        // 8. Re-check product stock against live database before finalization
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product "${item.name}" is no longer available in the store.`
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Ordered: ${item.quantity}.`
                });
            }
        }

        // 9. Atomically deduct purchased quantities from stock with concurrency protection
        let session = null;
        const topologyType = mongoose.connection.client?.topology?.description?.type;
        const supportsTransactions = topologyType === 'ReplicaSetWithPrimary' || topologyType === 'Sharded';

        if (supportsTransactions) {
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            } catch (sessionErr) {
                // Fallback to atomic conditional updates if transaction initiation fails
                session = null;
            }
        }

        const deductedItems = [];
        let stockDeductionFailed = false;
        let failedProductName = '';

        for (const item of order.items) {
            const updateFilter = { _id: item.product, stock: { $gte: item.quantity } };
            const updateAction = { $inc: { stock: -item.quantity } };
            const options = session ? { session, returnDocument: 'after' } : { returnDocument: 'after' };

            const updatedProduct = await Product.findOneAndUpdate(updateFilter, updateAction, options);
            if (!updatedProduct) {
                stockDeductionFailed = true;
                failedProductName = item.name;
                break;
            }
            deductedItems.push({ productId: item.product, quantity: item.quantity });
        }

        if (stockDeductionFailed) {
            if (session) {
                await session.abortTransaction();
                session.endSession();
            } else {
                // Compensating rollback for any partially deducted items
                for (const deducted of deductedItems) {
                    await Product.findByIdAndUpdate(deducted.productId, {
                        $inc: { stock: deducted.quantity }
                    });
                }
            }

            return res.status(400).json({
                success: false,
                message: `Could not deduct stock for "${failedProductName}". Insufficient stock available.`
            });
        }

        // 10. Mark order as 'paid'
        order.paymentStatus = 'paid';
        if (session) {
            await order.save({ session });
        } else {
            await order.save();
        }

        // 11. Clear authenticated customer's cart
        if (session) {
            await Customer.findByIdAndUpdate(userId, { $set: { cart: [] } }, { session });
            await session.commitTransaction();
            session.endSession();
        } else {
            await Customer.findByIdAndUpdate(userId, { $set: { cart: [] } });
        }

        // 12. Send success response with finalized paid order
        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully. Order finalized.',
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while verifying payment'
        });
    }
};

/**
 * Controller to retrieve all orders belonging to the authenticated customer (Step 9).
 * GET /orders
 */
const getMyOrders = async (req, res) => {
    try {
        // 1. Verify authenticated user identity
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const userId = req.user._id;

        // 2. Query orders scoped strictly to authenticated user, sorted newest first
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

        // 3. Return orders list
        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching orders'
        });
    }
};

/**
 * Controller to fetch a specific order by ID scoped to the authenticated customer (Step 10).
 * GET /orders/:id
 */
const getOrderById = async (req, res) => {
    try {
        // 1. Verify authenticated user identity
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const { id } = req.params;

        // 2. Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            });
        }

        // 3. Query order by requested ID AND authenticated user ID (critical authorization boundary)
        const order = await Order.findOne({ _id: id, user: req.user._id });

        // 4. Return 404 if order does not exist or belongs to another user (prevents enumeration)
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // 5. Return order details
        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching order details'
        });
    }
};

module.exports = {
    createOrder,
    createPaymentOrder,
    verifyPayment,
    getMyOrders,
    getOrderById
};
