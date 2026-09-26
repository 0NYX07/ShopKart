const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    // Lab 04: Wishlist array storing references to Product ObjectIds
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
