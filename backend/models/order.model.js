const mongoose = require('mongoose');

// Define Order Item Sub-Schema
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    // Snapshot of product name at the time of order placement
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Snapshot of product price at the time of order placement
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    }
}, { _id: false });

// Define Shipping Address Sub-Schema
const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

// Define Order Schema
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: function(items) {
                return Array.isArray(items) && items.length > 0;
            },
            message: 'Order must contain at least one item'
        }
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    razorpayOrderId: {
        type: String
    }
}, {
    timestamps: true
});

// Create Order Model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
