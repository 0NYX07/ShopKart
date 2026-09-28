import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCartHandler } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cartMsg, setCartMsg] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(false);

      try {
        const response = await getProductById(id);
        if (response.data && response.data.success) {
          setProduct(response.data.product);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0 || adding) return;
    setAdding(true);
    setCartMsg('');
    setActionError('');

    const res = await addToCartHandler(product._id);
    setAdding(false);

    if (res && res.success) {
      setCartMsg('Item added to cart!');
      setTimeout(() => setCartMsg(''), 2500);
    } else if (res && res.status === 401) {
      navigate('/login');
    } else {
      setActionError(res?.message || 'Failed to add item to cart');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="product-details-container">
        <div className="back-navigation">
          <Link to="/products" className="btn-back">
            ← Back to Products
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            Loading product details...
          </div>
        )}

        {/* Error State */}
        {!loading && (error || !product) && (
          <div className="error-state">
            Something went wrong while loading product details.
          </div>
        )}

        {/* Product Details Layout */}
        {!loading && !error && product && (
          <div className="product-details-card">
            <div className="product-details-image-section">
              <img
                src={product.image}
                alt={product.name}
                className="product-details-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x400?text=No+Image';
                }}
              />
            </div>

            <div className="product-details-info-section">
              <span className="product-category">{product.category}</span>
              <h1 className="product-details-title">{product.name}</h1>
              
              <div className="product-details-price-row">
                <span className="product-details-price">₹{product.price}</span>
                <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                </span>
              </div>

              <div className="product-details-description-box">
                <h3>Product Overview</h3>
                <p>{product.description}</p>
              </div>

              {cartMsg && <div className="card-success-message">{cartMsg}</div>}
              {actionError && <div className="card-error-message">{actionError}</div>}

              <div className="product-details-actions">
                <button 
                  onClick={handleAddToCart}
                  className="btn-add-cart-large" 
                  disabled={product.stock === 0 || adding}
                >
                  {adding ? 'Adding to Cart...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
