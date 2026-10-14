import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ShieldCheck, Clock, Sparkles, ArrowRight } from 'lucide-react';
import api from '../services/api';

import heroImg from '../assets/hero.jpg';
import springImg from '../assets/spring.jpg';
import watchesImg from '../assets/watches.jpg';
import homeImg from '../assets/home.jpg';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get('/customers/me');
        setCustomer(response.data);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [navigate]);

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderTopColor: '#000', borderRightColor: 'rgba(0,0,0,0.1)', borderBottomColor: 'rgba(0,0,0,0.1)', borderLeftColor: 'rgba(0,0,0,0.1)' }}></div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="app-container">
      {/* Single Unified Navbar across all pages */}
      <Navbar />

      <main className="catalog-container">
        
        {/* Hero Section */}
        <section className="hero-section animate-fade-in-up">
          <div className="hero-content">
            <div className="hero-welcome-badge">
              <Sparkles size={14} /> Welcome to Streia, {customer.fullName.split(' ')[0]}
            </div>
            <h1 className="hero-title">Discover Your Signature Style</h1>
            <p className="hero-subtitle">
              Explore Streia's exclusive collection of luxury apparel, cutting-edge electronics, and modern essentials.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/products')}>
                Explore Catalog <ArrowRight size={16} />
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                My Account
              </button>
            </div>
          </div>
          <div className="hero-image-wrapper" onClick={() => navigate('/products')}>
            <img 
              src={heroImg} 
              alt="Streia Fashion" 
              className="hero-img" 
            />
          </div>
        </section>

        {/* Features Bar */}
        <section className="features-bar animate-fade-in-up animate-delay-1">
          <div className="feature-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/products')}>
            <Truck size={24} /> Free Express Shipping
          </div>
          <div className="feature-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <ShieldCheck size={24} /> 100% Authentic Guarantee
          </div>
          <div className="feature-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <Clock size={24} /> 24/7 Dedicated Support
          </div>
        </section>

        {/* Category Quick Navigator Grid */}
        <section style={{ marginBottom: '3.5rem' }} className="animate-fade-in-up animate-delay-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Browse by Department</h2>
            <button type="button" className="btn-link-reset" onClick={() => navigate('/products')}>
              View All Products →
            </button>
          </div>
          <div className="department-grid">
            <div
              className="department-card"
              onClick={() => navigate('/products?category=Fashion')}
            >
              <h3 className="department-title">Fashion & Apparel</h3>
              <p className="department-desc">Denim, watches, and streetwear</p>
            </div>
            <div
              className="department-card"
              onClick={() => navigate('/products?category=Electronics')}
            >
              <h3 className="department-title">Electronics & Tech</h3>
              <p className="department-desc">Keyboards, audio, 4K displays</p>
            </div>
            <div
              className="department-card"
              onClick={() => navigate('/products?category=Home')}
            >
              <h3 className="department-title">Home & Living</h3>
              <p className="department-desc">Artisan coffee, nordic lamps</p>
            </div>
            <div
              className="department-card"
              onClick={() => navigate('/products?category=Books')}
            >
              <h3 className="department-title">Bestselling Books</h3>
              <p className="department-desc">Clean Code, Data-Intensive Apps</p>
            </div>
          </div>
        </section>

        {/* Featured Collections */}
        <section style={{ marginBottom: '4rem' }} className="animate-fade-in-up animate-delay-2">
          <h2 className="section-title">Streia Featured Curations</h2>
          <div className="collections-grid">
            <div className="collection-card" onClick={() => navigate('/products?category=Fashion')}>
              <div className="collection-image-wrapper">
                <img src={springImg} alt="Spring Fashion" className="collection-img" />
                <div className="collection-overlay">
                  <span className="collection-overlay-text">Explore Fashion →</span>
                </div>
              </div>
              <div className="collection-title">Spring Fashion Collection</div>
            </div>
            <div className="collection-card" onClick={() => navigate('/products?category=Fashion')}>
              <div className="collection-image-wrapper">
                <img src={watchesImg} alt="Luxury Watches" className="collection-img" />
                <div className="collection-overlay">
                  <span className="collection-overlay-text">Explore Watches →</span>
                </div>
              </div>
              <div className="collection-title">Luxury Timepieces</div>
            </div>
            <div className="collection-card" onClick={() => navigate('/products?category=Home')}>
              <div className="collection-image-wrapper">
                <img src={homeImg} alt="Home Essentials" className="collection-img" />
                <div className="collection-overlay">
                  <span className="collection-overlay-text">Explore Home →</span>
                </div>
              </div>
              <div className="collection-title">Modern Home Essentials</div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Home;
