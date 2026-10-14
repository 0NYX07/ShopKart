import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <div className="footer-brand">
            <div className="brand-badge">
              <img
                src={logoImg}
                alt="Streia Logo"
                className="brand-badge-img"
              />
            </div>
            <span className="brand-logo-text">
              STREIA
            </span>
          </div>
          <p className="footer-text">
            Streia — Your premier destination for fashion, electronics, books, and lifestyle products. Discover quality, craftsmanship, and elegance since 2026.
          </p>
          <div className="social-links">
            <a href="#instagram" aria-label="Instagram">Instagram</a>
            <a href="#twitter" aria-label="Twitter">Twitter</a>
            <a href="#facebook" aria-label="Facebook">Facebook</a>
          </div>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Shop</h3>
          <ul className="footer-links">
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/products?category=Electronics">Electronics</Link></li>
            <li><Link to="/products?category=Fashion">Fashion</Link></li>
            <li><Link to="/products?category=Books">Books</Link></li>
            <li><Link to="/products?category=Home">Home Essentials</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Account & Help</h3>
          <ul className="footer-links">
            <li><Link to="/dashboard">My Dashboard</Link></li>
            <li><Link to="/home">Customer Service</Link></li>
            <li><Link to="/dashboard">Order Tracking</Link></li>
            <li><Link to="/home">Returns & Exchanges</Link></li>
            <li><Link to="/home">Shipping Info</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Stay Connected</h3>
          <p className="footer-text">Subscribe for exclusive promotions and newest arrivals.</p>
          <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="subscribe-input"
              aria-label="Email for newsletter"
            />
            <button type="submit" className="subscribe-btn" aria-label="Subscribe">→</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Streia Inc. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#security">Security</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
