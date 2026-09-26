require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const Product = require('./models/product.model');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for credentials (cookies)
app.use(cors({
    origin: true,
    credentials: true
}));

// Middleware for parsing JSON requests
app.use(express.json());

// Middleware for parsing cookies
app.use(cookieParser());

// Mount routes under /customers
app.use('/customers', customerRoutes);

// Mount routes under /products
app.use('/products', productRoutes);

// Mount routes under /wishlist
app.use('/wishlist', wishlistRoutes);

// Basic root route
app.get('/', (req, res) => {
    res.json({ message: 'ShopKart Backend is running.' });
});

// Initial sample seed products for ShopKart Lab 03 Product Catalog
const seedProducts = [
    {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with blue switches, customizable keycaps, and durable aluminum frame.",
        price: 2999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60",
        stock: 15
    },
    {
        name: "Noise Cancelling Headphones",
        description: "Wireless over-ear headphones with active noise cancellation, high-fidelity sound, and 30-hour battery life.",
        price: 4999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        stock: 25
    },
    {
        name: "Wireless Gaming Mouse",
        description: "Ergonomic wireless gaming mouse with 16,000 DPI sensor and programmable buttons.",
        price: 1499,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60",
        stock: 10
    },
    {
        name: "Running Shoes",
        description: "Lightweight breathable mesh running shoes with cushioned foam soles.",
        price: 2499,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
        stock: 8
    },
    {
        name: "Smart Fitness Watch",
        description: "Fitness tracker with heart rate monitor, sleep tracking, GPS, and water resistance.",
        price: 3499,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
        stock: 12
    },
    {
        name: "Casual Denim Jacket",
        description: "Classic blue denim jacket made from 100% premium cotton.",
        price: 1999,
        category: "Clothing",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60",
        stock: 20
    }
];

const seedDatabaseIfEmpty = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            await Product.insertMany(seedProducts);
            console.log('Sample product catalog seeded into database.');
        }
    } catch (err) {
        console.error('Error seeding database:', err.message);
    }
};

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

const connectDB = async () => {
    try {
        // Try connecting to local MongoDB with 2.5s timeout
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2500 });
        console.log('Successfully connected to local MongoDB.');
        await seedDatabaseIfEmpty();
    } catch (err) {
        console.warn('Local MongoDB unavailable. Initializing In-Memory MongoDB fallback...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const memoryUri = mongoServer.getUri();
            await mongoose.connect(memoryUri);
            console.log('Successfully connected to In-Memory MongoDB.');
            await seedDatabaseIfEmpty();
        } catch (memErr) {
            console.error('In-Memory MongoDB connection failed:', memErr.message);
        }
    }
};

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
