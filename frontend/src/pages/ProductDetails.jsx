import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  AlertCircle,
  Heart,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, actionLoading, getItemQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [cartError, setCartError] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistToast, setWishlistToast] = useState({ show: false, text: '', isError: false });

  const isAddingToCart = actionLoading[id] === 'adding';
  const quantityInCart = getItemQuantity(id);

  useEffect(() => {
    const fetchProductAndWishlist = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/products/${id}`);
        // Support response.data.product or response.data
        const data = response.data?.product || response.data;
        setProduct(data);

        // Check if currently saved in wishlist
        try {
          const wishRes = await api.get('/wishlist');
          const savedItems = wishRes.data?.wishlist || [];
          const exists = savedItems.some((item) => (item._id || item) === id);
          setIsWishlisted(exists);
        } catch {
          // If unauthenticated, silently ignore wishlist check
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        const code = err.statusCode || err.response?.status;
        const msg = err.response?.data?.message || 'Product not found or failed to load.';
        setError(code ? `[HTTP ${code}] ${msg}` : msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductAndWishlist();
    }
  }, [id]);

  const handleQuantityDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleQuantityIncrease = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || !product) return;
    setCartError('');
    const res = await addToCart(id, quantity);
    if (res.success) {
      setAddedToast(true);
      setTimeout(() => {
        setAddedToast(false);
      }, 3500);
    } else {
      if (res.statusCode === 401) {
        setCartError('Please log in to add products to your cart.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setCartError(res.message || 'Unable to add to cart. Please try again.');
        setTimeout(() => setCartError(''), 4000);
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (wishlistSaving) return;

    setWishlistSaving(true);
    try {
      if (!isWishlisted) {
        await api.post(`/wishlist/${id}`);
        setIsWishlisted(true);
        setWishlistToast({
          show: true,
          text: `Added "${product?.name || 'Product'}" to your Wishlist! ♥`,
          isError: false,
        });
      } else {
        await api.delete(`/wishlist/${id}`);
        setIsWishlisted(false);
        setWishlistToast({
          show: true,
          text: `Removed "${product?.name || 'Product'}" from your Wishlist.`,
          isError: false,
        });
      }

      window.dispatchEvent(new CustomEvent('wishlist-updated'));
      setTimeout(() => setWishlistToast({ show: false, text: '', isError: false }), 3500);
    } catch (err) {
      const status = err.statusCode || err.response?.status;
      if (status === 401) {
        setWishlistToast({
          show: true,
          text: 'Please log in to save products to your wishlist.',
          isError: true,
        });
      } else {
        setWishlistToast({
          show: true,
          text: 'Unable to save product. Please try again.',
          isError: true,
        });
      }
      setTimeout(() => setWishlistToast({ show: false, text: '', isError: false }), 3500);
    } finally {
      setWishlistSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="catalog-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="state-container loading-state">
            <div className="spinner-large"></div>
            <p className="state-message">Loading product details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="catalog-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="state-container error-state">
            <div className="state-icon-wrapper error">
              <AlertCircle size={36} />
            </div>
            <h2 className="state-title">Product Unavailable</h2>
            <p className="state-message">{error || 'Could not find the requested product.'}</p>
            <Link to="/products" className="btn btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
              <ArrowLeft size={16} /> Back to Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { name, description, price, category, image, stock } = product;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className="app-container">
      <Navbar />

      <main className="catalog-container animate-fade-in-up">
        {/* Top Breadcrumbs & Back Navigation */}
        <div className="details-header-nav">
          <Link to="/products" className="back-link">
            <ArrowLeft size={18} /> Back to Products
          </Link>
          <div className="breadcrumb-trail">
            <Link to="/home">Home</Link>
            <span>/</span>
            <Link to="/products">Products</Link>
            <span>/</span>
            <Link to={`/products?category=${encodeURIComponent(category)}`}>{category}</Link>
            <span>/</span>
            <span className="breadcrumb-current">{name}</span>
          </div>
        </div>

        {/* Added to Cart Notification Toast */}
        {addedToast && (
          <div className="toast-notification animate-fade-in-up">
            <CheckCircle size={18} color="#10b981" />
            <span>
              <strong>{name}</strong> added to cart ({quantity} {quantity === 1 ? 'item' : 'items'})! 🛒
            </span>
          </div>
        )}

        {/* Wishlist Notification Toast */}
        {wishlistToast.show && (
          <div className="toast-notification animate-fade-in-up" style={{ zIndex: 100 }}>
            {wishlistToast.isError ? (
              <AlertCircle size={18} color="#ef4444" />
            ) : (
              <Heart size={18} color="#ef4444" fill="#fee2e2" />
            )}
            <span>{wishlistToast.text}</span>
          </div>
        )}

        {/* Cart Error Notification Toast */}
        {cartError && (
          <div className="toast-notification animate-fade-in-up" style={{ zIndex: 100 }}>
            <AlertCircle size={18} color="#ef4444" />
            <span>{cartError}</span>
          </div>
        )}

        {/* Product Details Card */}
        <div className="product-details-card">
          {/* Product Image Section */}
          <div className="product-details-image-col">
            <div className="product-details-image-wrapper">
              <img
                src={image}
                alt={name}
                className="product-details-img"
                onError={(e) => {
                  e.target.onerror = null;
                  const fallbacks = {
                    Books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
                    Electronics: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
                    Fashion: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
                    Home: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
                  };
                  e.target.src = fallbacks[category] || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80';
                }}
              />
              <span className="product-details-category-badge">{category}</span>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="product-details-info-col">
            <div className="product-meta-header">
              <span className="product-category-text">{category}</span>
              <span
                className={`stock-badge ${
                  isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-in'
                }`}
              >
                {isOutOfStock ? (
                  <>
                    <AlertTriangle size={14} /> Out of stock
                  </>
                ) : isLowStock ? (
                  <>Only {stock} units left in stock</>
                ) : (
                  <>
                    <CheckCircle size={14} /> In Stock ({stock} units available)
                  </>
                )}
              </span>
            </div>

            <h1 className="product-details-title">{name}</h1>

            <div className="product-details-price-row">
              <span className="product-details-price">
                ₹{Number(price).toLocaleString('en-IN')}
              </span>
              <span className="tax-inclusive-tag">Inclusive of all taxes</span>
            </div>

            <div className="product-details-divider"></div>

            <div className="product-details-description">
              <h3 className="section-subtitle">Description</h3>
              <p>{description}</p>
            </div>

            <div className="product-details-divider"></div>

            {/* Quantity Selector & Action */}
            {!isOutOfStock && (
              <div className="product-action-row">
                <div className="quantity-control-group">
                  <label htmlFor="product-qty" className="quantity-label">Quantity:</label>
                  <div className="quantity-selector">
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={handleQuantityDecrease}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="quantity-value" id="product-qty">{quantity}</span>
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={handleQuantityIncrease}
                      disabled={quantity >= stock}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  id="add-to-cart-btn"
                  className="btn btn-primary add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart || quantity + quantityInCart > stock}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 size={18} className="spinner-inline" />
                      <span>Adding...</span>
                    </>
                  ) : quantity + quantityInCart > stock && quantityInCart > 0 ? (
                    <>
                      <ShoppingBag size={18} />
                      <span>Max stock reached ({quantityInCart} in cart)</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Cart {quantityInCart > 0 ? `(${quantityInCart} in cart)` : ''}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="toggle-wishlist-btn"
                  className={`btn btn-details-wishlist ${isWishlisted ? 'btn-wishlisted' : ''}`}
                  onClick={handleWishlistToggle}
                  disabled={wishlistSaving}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  {wishlistSaving ? (
                    <>
                      <Loader2 size={18} className="spinner-inline" />
                      <span>Saving...</span>
                    </>
                  ) : isWishlisted ? (
                    <>
                      <Heart size={18} fill="#ef4444" color="#ef4444" />
                      <span>Saved in Wishlist</span>
                    </>
                  ) : (
                    <>
                      <Heart size={18} />
                      <span>Save to Wishlist</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {isOutOfStock && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="out-of-stock-banner">
                  <AlertTriangle size={18} />
                  <span>This item is currently out of stock. Save it to get notified!</span>
                </div>
                <button
                  type="button"
                  id="toggle-wishlist-btn-out"
                  className={`btn btn-details-wishlist ${isWishlisted ? 'btn-wishlisted' : ''}`}
                  onClick={handleWishlistToggle}
                  disabled={wishlistSaving}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {wishlistSaving ? (
                    <>
                      <Loader2 size={18} className="spinner-inline" />
                      <span>Saving...</span>
                    </>
                  ) : isWishlisted ? (
                    <>
                      <Heart size={18} fill="#ef4444" color="#ef4444" />
                      <span>Saved in Wishlist</span>
                    </>
                  ) : (
                    <>
                      <Heart size={18} />
                      <span>Save to Wishlist</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Trust Features */}
            <div className="product-trust-features">
              <div className="trust-feature-item">
                <Truck size={18} className="trust-icon" />
                <div>
                  <strong>Free Express Shipping</strong>
                  <p>Delivered within 2-4 business days</p>
                </div>
              </div>
              <div className="trust-feature-item">
                <ShieldCheck size={18} className="trust-icon" />
                <div>
                  <strong>100% Genuine Guarantee</strong>
                  <p>Direct from verified brand suppliers</p>
                </div>
              </div>
              <div className="trust-feature-item">
                <RotateCcw size={18} className="trust-icon" />
                <div>
                  <strong>30-Day Easy Returns</strong>
                  <p>Hassle-free replacement or refund</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
