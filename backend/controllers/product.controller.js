const mongoose = require('mongoose');
const Product = require('../models/product.model');

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'All fields are mandatory (name, description, price, category, image, stock)',
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Price must be a valid number greater than 0',
      });
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Stock must be a valid non-negative number',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category: category.trim(),
      image: image.trim(),
      stock: parsedStock,
    });

    return res.status(201).json({
      statusCode: 201,
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error creating product',
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (category && category.trim() && !['all', 'all categories'].includes(category.trim().toLowerCase())) {
      query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    }

    const products = await Product.find(query).sort(sortOptions);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error fetching products',
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      statusCode: 200,
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Server error fetching product details',
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
};
