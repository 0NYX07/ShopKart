import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const CATEGORY_FALLBACKS = {
  Books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  Electronics: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
  Fashion: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
  Home: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
};

const getFallbackImage = (category) => {
  return (
    CATEGORY_FALLBACKS[category] ||
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
  );
};

const WishlistCard = ({ product, onRemove }) => {
  const { _id, name, price, category, image, stock } = product;
  const [removing, setRemoving] = useState(false);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const fallbackImg = getFallbackImage(category);

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await onRemove(_id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="product-card wishlist-card animate-fade-in-up">
      <div className="product-card-image-wrapper">
        <img
          src={image || fallbackImg}
          alt={name}
          className="product-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImg;
          }}
        />
        <span className="product-card-category">{category}</span>
      </div>

      <div className="product-card-content">
        <h3 className="product-card-title" title={name}>
          {name}
        </h3>

        <div className="product-card-meta">
          <span className="product-card-price">
            ₹{Number(price).toLocaleString('en-IN')}
          </span>

          <span
            className={`stock-badge ${
              isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-in'
            }`}
          >
            {isOutOfStock ? (
              <>
                <AlertTriangle size={12} /> Out of stock
              </>
            ) : isLowStock ? (
              <>Only {stock} left</>
            ) : (
              <>
                <CheckCircle size={12} /> {stock} units left
              </>
            )}
          </span>
        </div>

        <div className="wishlist-card-actions">
          <Link
            to={`/products/${_id}`}
            className="btn btn-product-details"
            title="View full product details"
          >
            <Eye size={15} />
            View Details
          </Link>

          <button
            type="button"
            className="btn btn-remove-wishlist"
            onClick={handleRemove}
            disabled={removing}
            title="Remove from wishlist"
            aria-label={`Remove ${name} from wishlist`}
          >
            {removing ? (
              <>
                <Loader2 size={15} className="spinner-inline" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Remove
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
