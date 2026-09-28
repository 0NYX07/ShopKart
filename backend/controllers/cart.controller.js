const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Controller to add a product to the user's cart (or increment quantity if already present)
const addToCart = async (req, res) => {
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

        // 2. Check if product exists in MongoDB database
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

        // 4. Check if product already exists in user's cart
        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (cartItemIndex > -1) {
            // Product is already in cart -> Calculate new quantity
            const newQuantity = customer.cart[cartItemIndex].quantity + 1;

            // Validate requested quantity against product stock limit
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Requested quantity exceeds available stock (${product.stock} left)`
                });
            }

            customer.cart[cartItemIndex].quantity = newQuantity;
        } else {
            // Product is not in cart -> Validate stock for initial item
            if (product.stock < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Product is currently out of stock'
                });
            }

            customer.cart.push({
                product: productId,
                quantity: 1
            });
        }

        // 5. Save updated customer document
        await customer.save();

        // 6. Populate product details before returning response
        await customer.populate({
            path: 'cart.product',
            select: 'name price category image stock description'
        });

        return res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            cart: customer.cart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while adding to cart',
            error: error.message
        });
    }
};

// Controller to get current authenticated user's cart with populated products
const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find customer and populate cart.product references
        const customer = await Customer.findById(userId).populate({
            path: 'cart.product',
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
            cart: customer.cart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching cart',
            error: error.message
        });
    }
};

// Controller to update item quantity in cart (PATCH /cart/:productId)
const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const userId = req.user._id;

        // 1. Validate product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Validate quantity input
        const newQty = Number(quantity);
        if (isNaN(newQty) || newQty < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a valid number of at least 1'
            });
        }

        // 3. Find product to check stock limit
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Stock validation check
        if (newQty > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Quantity cannot exceed available stock (${product.stock} left)`
            });
        }

        // 4. Find user and locate cart item
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in cart'
            });
        }

        // 5. Update quantity and save
        cartItem.quantity = newQty;
        await customer.save();

        // 6. Populate updated cart details
        await customer.populate({
            path: 'cart.product',
            select: 'name price category image stock description'
        });

        return res.status(200).json({
            success: true,
            message: 'Cart quantity updated',
            cart: customer.cart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while updating cart quantity',
            error: error.message
        });
    }
};

// Controller to remove a product from cart (DELETE /cart/:productId)
const removeFromCart = async (req, res) => {
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

        // 2. Find customer
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 3. Filter out product from cart array
        customer.cart = customer.cart.filter(
            (item) => item.product.toString() !== productId
        );

        await customer.save();

        // 4. Populate updated cart details
        await customer.populate({
            path: 'cart.product',
            select: 'name price category image stock description'
        });

        return res.status(200).json({
            success: true,
            message: 'Product removed from cart',
            cart: customer.cart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while removing from cart',
            error: error.message
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
};
