import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CATEGORY_FALLBACKS = {
  Books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  Electronics: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
  Fashion: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
  Home: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
};

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, actionLoading } = useCart();
  const [itemError, setItemError] = useState('');

  const { product, quantity } = item;
  if (!product) return null;

  const { _id: productId, name, price, stock, image, category } = product;
  const isLoading = !!actionLoading[productId];
  const isRemoving = actionLoading[productId] === 'removing';
  const isUpdating = actionLoading[productId] === 'updating';

  const isAtMaxStock = quantity >= stock;
  const fallbackImg = CATEGORY_FALLBACKS[category] || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80';

  const handleDecrease = async () => {
    if (isLoading) return;
    setItemError('');
    if (quantity <= 1) {
      // When clicking '-' at quantity 1 (or less), remove the product from the cart
      const res = await removeFromCart(productId);
      if (!res.success) {
        setItemError(res.message);
        setTimeout(() => setItemError(''), 4000);
      }
      return;
    }
    const res = await updateQuantity(productId, quantity - 1);
    if (!res.success) {
      setItemError(res.message);
      setTimeout(() => setItemError(''), 4000);
    }
  };

  const handleIncrease = async () => {
    if (quantity >= stock || isLoading) return;
    setItemError('');
    const res = await updateQuantity(productId, quantity + 1);
    if (!res.success) {
      setItemError(res.message);
      setTimeout(() => setItemError(''), 4000);
    }
  };

  const handleRemove = async () => {
    if (isLoading) return;
    setItemError('');
    const res = await removeFromCart(productId);
    if (!res.success) {
      setItemError(res.message);
      setTimeout(() => setItemError(''), 4000);
    }
  };

  const lineTotal = Number(price * quantity) || 0;

  return (
    <div className="cart-item-card animate-fade-in-up" id={`cart-item-${productId}`}>
      <div className="cart-item-image-wrapper">
        <Link to={`/products/${productId}`}>
          <img
            src={image || fallbackImg}
            alt={name}
            className="cart-item-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImg;
            }}
          />
        </Link>
      </div>

      <div className="cart-item-details">
        <div className="cart-item-header">
          <div>
            <span className="cart-item-category">{category}</span>
            <h3 className="cart-item-title">
              <Link to={`/products/${productId}`}>{name}</Link>
            </h3>
          </div>
          <div className="cart-item-price-unit">
            ₹{Number(price).toLocaleString('en-IN')}
            <span className="cart-unit-label"> each</span>
          </div>
        </div>

        {/* Stock info */}
        <div className="cart-item-stock-info">
          {stock <= 5 && stock > 0 ? (
            <span className="cart-stock-low">Only {stock} available in stock</span>
          ) : (
            <span className="cart-stock-ok">In Stock ({stock} available)</span>
          )}
          {isAtMaxStock && (
            <span className="cart-max-stock-badge">Max stock reached</span>
          )}
        </div>

        {/* Action and Quantity Controls */}
        <div className="cart-item-actions-row">
          <div className="cart-quantity-selector" aria-label="Quantity selector">
            <button
              type="button"
              className={`cart-qty-btn decrease-qty-btn ${quantity <= 1 ? 'is-remove-action' : ''}`}
              onClick={handleDecrease}
              disabled={isLoading}
              aria-label={quantity <= 1 ? `Remove ${name} from cart` : 'Decrease quantity'}
              title={quantity <= 1 ? 'Remove from cart (-)' : 'Decrease quantity'}
              id={`decrease-qty-${productId}`}
            >
              {isRemoving ? (
                <Loader2 size={13} className="spinner-inline" />
              ) : (
                <Minus size={14} />
              )}
            </button>
            <span className="cart-qty-display" aria-live="polite">
              {isUpdating ? <Loader2 size={13} className="spinner-inline" /> : quantity}
            </span>
            <button
              type="button"
              className="cart-qty-btn increase-qty-btn"
              onClick={handleIncrease}
              disabled={quantity >= stock || isLoading}
              aria-label="Increase quantity"
              title={quantity >= stock ? `Maximum stock (${stock}) reached` : 'Increase quantity'}
              id={`increase-qty-${productId}`}
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="cart-item-line-total">
            <span className="line-total-label">Total: </span>
            <span className="line-total-value">₹{lineTotal.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="button"
            className="cart-remove-btn"
            onClick={handleRemove}
            disabled={isLoading}
            aria-label={`Remove ${name} from cart`}
          >
            {isRemoving ? (
              <>
                <Loader2 size={14} className="spinner-inline" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Remove</span>
              </>
            )}
          </button>
        </div>

        {/* Error notification banner if item mutation failed */}
        {itemError && (
          <div className="cart-item-error-toast animate-fade-in-up">
            <AlertTriangle size={13} />
            <span>{itemError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;
