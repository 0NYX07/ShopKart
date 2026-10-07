import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCart, 
  addToCart as apiAddToCart, 
  updateCartQuantity as apiUpdateCartQuantity, 
  removeFromCart as apiRemoveFromCart 
} from '../services/api';

// Create React Context for Cart Global State
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch cart data from backend API
  const fetchCart = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await getCart();
      if (response.data && response.data.success) {
        setCartItems(response.data.cart || []);
      } else {
        setError(true);
      }
    } catch (err) {
      // If user is unauthenticated or server error, set empty cart state
      setCartItems([]);
      if (err.response && err.response.status !== 401) {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch cart when component mounts
  useEffect(() => {
    fetchCart();
  }, []);

  // Handler to add a product to cart (or increment quantity)
  const addToCartHandler = async (productId) => {
    try {
      const response = await apiAddToCart(productId);
      if (response.data && response.data.success) {
        setCartItems(response.data.cart);
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add product to cart';
      return { success: false, message: msg, status: err.response?.status };
    }
  };

  // Handler to update cart item quantity (+ or -)
  const updateQuantityHandler = async (productId, newQuantity) => {
    try {
      const response = await apiUpdateCartQuantity(productId, newQuantity);
      if (response.data && response.data.success) {
        setCartItems(response.data.cart);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message: msg };
    }
  };

  // Handler to remove a product from cart
  const removeFromCartHandler = async (productId) => {
    try {
      const response = await apiRemoveFromCart(productId);
      if (response.data && response.data.success) {
        setCartItems(response.data.cart);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      return { success: false, message: msg };
    }
  };

  // Handler to clear global cart state immediately (e.g. on successful order payment)
  const clearCartState = () => {
    setCartItems([]);
  };

  // Derived state calculations (not stored separately in DB or state)
  // 1. Total Count = sum of all quantities
  const totalCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  // 2. Subtotal = sum of (product price * quantity)
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        totalCount,
        subtotal,
        fetchCart,
        clearCartState,
        addToCartHandler,
        updateQuantityHandler,
        removeFromCartHandler
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for consuming Cart Context easily in components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
