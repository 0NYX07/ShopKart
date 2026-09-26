import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';

function ProductDetails() {
  const { id } = useParams();
  const { addToCart, setIsCartOpen } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchProductDetails = async () => {
      setLoading(true);
      setError(false);

      try {
        const response = await getProductById(id);
        if (!isCancelled) {
          if (response.data && response.data.success) {
            setProduct(response.data.product);
          } else {
            setError(true);
          }
        }
      } catch {
        if (!isCancelled) {
          setError(true);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchProductDetails();
    }

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const handleAdd = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      setIsCartOpen(true);
    }, 400);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="details-main-container">
        {/* Breadcrumb Bar */}
        <div className="breadcrumb-nav">
          <Link to="/products" className="breadcrumb-back-btn">
            ← Back to Products
          </Link>
          <span className="breadcrumb-separator">/</span>
          {product && (
            <>
              <span className="breadcrumb-cat">{product.category}</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{product.name}</span>
            </>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="details-skeleton">
            <div className="skeleton-image shimmer"></div>
            <div className="details-skeleton-info">
              <div className="skeleton-text skeleton-title shimmer"></div>
              <div className="skeleton-text skeleton-desc shimmer"></div>
              <div className="skeleton-text skeleton-price shimmer"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && (error || !product) && (
          <div className="empty-state-card error-tint">
            <div className="empty-icon">⚠️</div>
            <h3>Product not found</h3>
            <p>The product you are looking for does not exist or has been removed.</p>
            <Link to="/products" className="btn-retry">
              Return to Catalog
            </Link>
          </div>
        )}

        {/* Product Details Card */}
        {!loading && !error && product && (
          <div className="details-layout-card">
            {/* Left: Product Media Gallery */}
            <div className="details-media-box">
              <img
                src={product.image}
                alt={product.name}
                className="details-main-image"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
                }}
              />
              <div className="details-tag-badges">
                <span className="pill-badge pill-blue">Authentic Guaranteed</span>
                <span className="pill-badge pill-yellow">Top Choice</span>
              </div>
            </div>

            {/* Right: Info & Purchase Controls */}
            <div className="details-content-box">
              <div className="details-category-row">
                <span className="details-category-pill">{product.category}</span>
                <span className="details-rating-badge">⭐ 4.9 (128 verified reviews)</span>
              </div>

              <h1 className="details-product-title">{product.name}</h1>

              <div className="details-price-row">
                <div className="details-price-tag">
                  <span className="currency">₹</span>
                  <span className="amount">{product.price.toLocaleString()}</span>
                </div>
                <span className={`stock-indicator-pill ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} units left)` : 'Out of Stock'}
                </span>
              </div>

              <div className="details-description-section">
                <h4>About This Product</h4>
                <p>{product.description}</p>
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="details-actions-panel">
                <div className="quantity-selector-box">
                  <span className="qty-label">Quantity:</span>
                  <div className="qty-stepper">
                    <button 
                      type="button" 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="qty-step-btn"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-step-value">{quantity}</span>
                    <button 
                      type="button" 
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="qty-step-btn"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn-add-cart-jumbo ${addedAnimation ? 'btn-pop' : ''}`}
                  disabled={product.stock === 0}
                  onClick={handleAdd}
                >
                  {product.stock > 0 ? (
                    <span>Add {quantity > 1 ? `${quantity} Items` : ''} to Cart • ₹{(product.price * quantity).toLocaleString()}</span>
                  ) : (
                    <span>Currently Unavailable</span>
                  )}
                </button>
              </div>

              {/* Light Color Perk Badges (Red, Blue, Yellow highlights) */}
              <div className="details-perks-grid">
                <div className="perk-box perk-blue">
                  <div className="perk-icon">🚚</div>
                  <div className="perk-text">
                    <h6>Free Express Dispatch</h6>
                    <p>Delivered in 2-3 business days</p>
                  </div>
                </div>
                <div className="perk-box perk-red">
                  <div className="perk-icon">🔄</div>
                  <div className="perk-text">
                    <h6>30-Day Easy Returns</h6>
                    <p>Hassle-free replacement policy</p>
                  </div>
                </div>
                <div className="perk-box perk-yellow">
                  <div className="perk-icon">🛡️</div>
                  <div className="perk-text">
                    <h6>1-Year Full Warranty</h6>
                    <p>Official brand covered protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductDetails;
