const Product = require('../models/product.model');
const mongoose = require('mongoose');

// Controller for creating a new product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        // 1. Validate required fields
        if (!name || !description || price === undefined || !category || !image || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'All fields (name, description, price, category, image, stock) are required.'
            });
        }

        // 2. Validate price and stock values
        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a number greater than 0.'
            });
        }

        if (typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock must be a non-negative number.'
            });
        }

        // 3. Create product in MongoDB
        const newProduct = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        });

        // 4. Return HTTP 201 with created product
        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: newProduct
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to create product'
        });
    }
};

// Controller to get all products (supports ?search=, ?category=, and ?sort=)
const getAllProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;

        // Build MongoDB query dynamically
        const query = {};

        // Case-insensitive search on name field if search query param exists
        if (search && search.trim() !== '') {
            const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.name = { $regex: safeSearch, $options: 'i' };
        }

        // Exact match category filter if category query param exists
        if (category && category.trim() !== '') {
            query.category = category.trim();
        }

        // Build sort configuration dynamically
        let sortConfig = { createdAt: -1 };
        if (sort === 'price_asc') {
            sortConfig = { price: 1 };
        } else if (sort === 'price_desc') {
            sortConfig = { price: -1 };
        }

        // Find matching products in MongoDB with sorting
        const products = await Product.find(query).sort(sortConfig);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching products',
            error: error.message
        });
    }
};

// Controller to get a single product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }

        // Find product by ID
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching product details',
            error: error.message
        });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById
};
