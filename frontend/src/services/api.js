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

export default api;
