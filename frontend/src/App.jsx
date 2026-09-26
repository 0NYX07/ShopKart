import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Default to Catalog so user immediately sees and interacts with products */}
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
        <CartDrawer />
        <Toast />
      </Router>
    </CartProvider>
  );
}

export default App;
