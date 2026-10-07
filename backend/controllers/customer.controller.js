const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

// Controller for registering a new customer
const registerCustomer = async (req, res) => {
    try {
        const fullName = req.body.fullName || req.body.name;
        const { email, password, phone } = req.body;

        // 1. Check whether all required fields are present
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields (fullName/name, email, password, phone) are required.'
            });
        }

        // 2. Check password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // 3. Check whether email already exists
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists.'
            });
        }

        // 4. Hash plain password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create new customer document in MongoDB
        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        // 6. Send success response (excluding password details)
        return res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            customer: {
                _id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone
            }
        });

    } catch (error) {
        // 7. Catch any unexpected server errors
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again later.'
        });
    }
};

// Controller for logging in a customer
const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate that both email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        // 2. Find the customer by email
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // 3. Compare the entered password with the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // 4. Generate JWT
        const token = generateToken(customer._id);

        // 5. Store JWT inside an HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevents client-side scripts from reading the cookie
            maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
        });

        // 6. Return successful response
        return res.status(200).json({
            success: true,
            message: 'Login successful'
        });

    } catch (error) {
        // 7. Catch any unexpected server errors
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again later.'
        });
    }
};

// Controller to get the profile of the currently logged-in customer
const getMyProfile = async (req, res) => {
    try {
        // req.user is set by the protect middleware
        return res.status(200).json(req.user);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again later.'
        });
    }
};

// Controller to log out a customer
const logoutCustomer = async (req, res) => {
    try {
        // Clear the HttpOnly token cookie
        res.clearCookie('token', {
            httpOnly: true
        });

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again later.'
        });
    }
};

module.exports = {
    registerCustomer,
    loginCustomer,
    getMyProfile,
    logoutCustomer
};
