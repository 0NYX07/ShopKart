require('dotenv').config();
const Razorpay = require('razorpay');

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

// Fail clearly if required credentials are missing
if (!key_id || !key_secret) {
    throw new Error(
        'Razorpay configuration error: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment variables. Please configure them in your .env file.'
    );
}

// Initialize Razorpay client instance
const razorpay = new Razorpay({
    key_id,
    key_secret
});

module.exports = razorpay;
