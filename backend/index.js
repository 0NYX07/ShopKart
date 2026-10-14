const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });


const app = express();

app.use(express.json());

app.use(cookieParser());

const allowedOrigins = [
  'https://shopkart-frontend-mocha.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.get('/', (req, res) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: 'Welcome to the Streia E-Commerce API',
    status: 'Server is running healthy',
    endpoints: {
      home: 'GET /',
      customers: {
        getAll: 'GET /customers (or /users)',
        register: 'POST /customers/register (or /users/register)',
        login: 'POST /customers/login (or /users/login)',
        profile: 'GET /customers/me (or /users/me)',
        logout: 'POST /customers/logout (or /users/logout)',
        changePassword: 'PATCH /customers/change-password (or /users/change-password)',
      },
      products: {
        getAll: 'GET /products',
        search: 'GET /products?search=<term>',
        filterByCategory: 'GET /products?category=<category>',
        sort: 'GET /products?sort=price_asc|price_desc',
        getById: 'GET /products/:id',
        create: 'POST /products',
      },
      cart: {
        getCart: 'GET /cart (Protected)',
        addToCart: 'POST /cart/:productId (Protected)',
        updateQuantity: 'PATCH /cart/:productId (Protected)',
        removeFromCart: 'DELETE /cart/:productId (Protected)',
      },
      wishlist: {
        getWishlist: 'GET /wishlist (Protected)',
        addToWishlist: 'POST /wishlist/:productId (Protected)',
        removeFromWishlist: 'DELETE /wishlist/:productId (Protected)',
        toggleWishlist: 'PATCH /wishlist/:productId/toggle (Protected)',
      },
      orders: {
        paymentConfig: 'GET /orders/payment-config (Protected)',
        updatePaymentConfig: 'POST /orders/payment-config (Protected)',
        createPaymentOrder: 'POST /orders/create-payment-order (Protected)',
        verifyPayment: 'POST /orders/verify-payment (Protected)',
        recordFailure: 'POST /orders/record-failure (Protected - Simulation)',
        getMyOrders: 'GET /orders (Protected)',
        getOrderById: 'GET /orders/:id (Protected)',
        updateStatus: 'PATCH /orders/:id/status (Protected - Bonus)',
      },
    },
  });
});

app.use('/customers', customerRoutes);
app.use('/users', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/customers/cart', cartRoutes);
app.use('/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
const { MongoMemoryServer } = require('mongodb-memory-server');

const startServer = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    try {
      console.log('Attempting to connect to MongoDB Atlas...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to MongoDB Atlas');
    } catch (err) {
      console.log('Atlas connection failed (Likely IP not whitelisted). Falling back to local In-Memory MongoDB...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to In-Memory MongoDB');
    }

    const Product = require('./models/product.model');
    const sampleProducts = require('./utils/seedData');
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(sampleProducts);
      console.log(`Database initialized with ${sampleProducts.length} sample products.`);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

startServer();
