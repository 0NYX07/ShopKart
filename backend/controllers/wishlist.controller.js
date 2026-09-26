const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Controller to add a product to the authenticated user's wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        // 1. Validate product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Check if product exists in MongoDB
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // 3. Find current authenticated user
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 4. Check if product is already in user's wishlist (Prevent Duplicates)
        const isAlreadySaved = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (isAlreadySaved) {
            return res.status(409).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        // 5. Add product reference to wishlist array and save
        customer.wishlist.push(productId);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: 'Product added to wishlist'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while adding product to wishlist',
            error: error.message
        });
    }
};

// Controller to get the current authenticated user's wishlist with populated products
const getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find user and populate wishlist array with Product details
        const customer = await Customer.findById(userId).populate({
            path: 'wishlist',
            select: 'name price category image stock description'
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching wishlist',
            error: error.message
        });
    }
};

// Controller to remove a product from the current user's wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        // 1. Validate product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Find current authenticated user
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 3. Check if product is in the user's wishlist
        const exists = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                success: false,
                message: 'Product not in wishlist'
            });
        }

        // 4. Filter out product ID from wishlist array and save
        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await customer.save();

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while removing product from wishlist',
            error: error.message
        });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};
