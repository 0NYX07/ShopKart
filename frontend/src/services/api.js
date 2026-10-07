import axios from 'axios';

// Axios instance configured with backend URL and credentials enabled for cookies
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

// Helper function to fetch products with query parameters (search, category, sort)
export const getProducts = (params) => {
  return api.get('/products', { params });
};

// Helper function to fetch a single product by ID
export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

// --- Lab 04: Wishlist API Service Helpers ---

// Add a product to the user's wishlist
export const addToWishlist = (productId) => {
  return api.post(`/wishlist/${productId}`);
};

// Fetch current user's wishlist with populated product details
export const getWishlist = () => {
  return api.get('/wishlist');
};

// Remove a product from the user's wishlist
export const removeFromWishlist = (productId) => {
  return api.delete(`/wishlist/${productId}`);
};

// --- Lab 05: Cart API Service Helpers ---

// Add product to cart (or increment quantity)
export const addToCart = (productId) => {
  return api.post(`/cart/${productId}`);
};

// Fetch current user's cart with populated product details
export const getCart = () => {
  return api.get('/cart');
};

// Update cart item quantity
export const updateCartQuantity = (productId, quantity) => {
  return api.patch(`/cart/${productId}`, { quantity });
};

// Remove product from cart
export const removeFromCart = (productId) => {
  return api.delete(`/cart/${productId}`);
};

// --- Lab 06: Checkout & Orders API Service Helpers ---

// Create payment order on server with validated shipping address
export const createPaymentOrder = (shippingAddress) => {
  return api.post('/orders/create-payment-order', { shippingAddress });
};

// Cryptographically verify Razorpay payment on server
export const verifyPayment = (paymentData) => {
  return api.post('/orders/verify-payment', paymentData);
};

// Fetch list of orders belonging to the authenticated user
export const getMyOrders = () => {
  return api.get('/orders');
};

// Fetch specific order details by ID belonging to the authenticated user
export const getOrderById = (id) => {
  return api.get(`/orders/${id}`);
};

export default api;
