import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { getProducts, getWishlist } from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Electronics', 'Clothing', 'Footwear', 'Home & Kitchen', 'Books']);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch user's wishlist if logged in to display saved state
  const loadWishlistIds = async () => {
    try {
      const res = await getWishlist();
      if (res.data && res.data.success && Array.isArray(res.data.wishlist)) {
        setWishlistIds(res.data.wishlist.map(item => item._id));
      }
    } catch {
      // User may not be logged in, ignore error
    }
  };

  useEffect(() => {
    loadWishlistIds();
  }, []);

  // Fetch products whenever search, category, or sort state changes
  useEffect(() => {
    let isCancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      setError(false);

      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category.trim()) params.category = category.trim();
        if (sort.trim()) params.sort = sort.trim();

        const response = await getProducts(params);

        if (!isCancelled) {
          if (response.data && response.data.success) {
            setProducts(response.data.products);

            // Update available categories dynamically
            const fetchedCats = response.data.products.map(p => p.category);
            setCategories(prev => Array.from(new Set([...prev, ...fetchedCats])));
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

    fetchProducts();
    return () => {
      isCancelled = true;
    };
  }, [search, category, sort]);

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="catalog-main-container">
        {/* Modern Bauhaus / Light Color Hero Section */}
        <section className="catalog-hero-banner">
          <div className="hero-badge-group">
            <span className="pill-badge pill-red">✨ New Season 2026</span>
            <span className="pill-badge pill-blue">🚀 Instant Delivery</span>
            <span className="pill-badge pill-yellow">⭐ 4.9 Star Verified</span>
          </div>

          <h1 className="hero-title">
            Discover Curated Essentials For Your Everyday Life
          </h1>
          <p className="hero-subtitle">
            Explore premium electronics, tailored fashion, ergonomic footwear, and modern lifestyle products.
          </p>
        </section>

        {/* Filter Controls Bar */}
        <div className="catalog-filter-bar">
          <SearchBar
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            categories={categories}
            sort={sort}
            setSort={setSort}
          />
        </div>

        {/* Results Metadata */}
        <div className="catalog-results-header">
          <span className="results-count">
            Showing <strong>{products.length}</strong> items {category ? `in "${category}"` : ''}
          </span>
          {(search || category || sort) && (
            <button 
              className="btn-reset-filters"
              onClick={() => {
                setSearch('');
                setCategory('');
                setSort('');
              }}
            >
              Reset Filters ↺
            </button>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="skeleton-card">
                <div className="skeleton-image shimmer"></div>
                <div className="skeleton-text skeleton-title shimmer"></div>
                <div className="skeleton-text skeleton-desc shimmer"></div>
                <div className="skeleton-text skeleton-price shimmer"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="empty-state-card error-tint">
            <div className="empty-icon">⚠️</div>
            <h3>Unable to fetch products</h3>
            <p>Could not connect to the product service. Please check your backend connection.</p>
            <button 
              className="btn-retry" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="empty-state-card">
            <div className="empty-icon">🔍</div>
            <h3>No matching products found</h3>
            <p>We couldn't find any products matching your current filters.</p>
            <button 
              className="btn-retry" 
              onClick={() => {
                setSearch('');
                setCategory('');
                setSort('');
              }}
            >
              Clear Search & Filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                initialInWishlist={wishlistIds.includes(product._id)}
                onWishlistUpdate={loadWishlistIds}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;
