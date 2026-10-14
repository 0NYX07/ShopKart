import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageX, AlertCircle, RefreshCw, Sparkles, Filter } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';

const QUICK_CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const [search, setSearch] = useState(() => searchParams.get('search') || '');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    let ignore = false;
    api.get('/wishlist')
      .then((res) => {
        if (!ignore) {
          const items = res.data?.wishlist || [];
          setWishlistIds(new Set(items.map((p) => p._id)));
        }
      })
      .catch(() => {});

    const handleUpdate = () => {
      api.get('/wishlist')
        .then((res) => {
          if (!ignore) {
            const items = res.data?.wishlist || [];
            setWishlistIds(new Set(items.map((p) => p._id)));
          }
        })
        .catch(() => {});
    };

    window.addEventListener('wishlist-updated', handleUpdate);
    return () => {
      ignore = true;
      window.removeEventListener('wishlist-updated', handleUpdate);
    };
  }, []);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category.trim() && category.toLowerCase() !== 'all') params.category = category.trim();
      if (sort.trim()) params.sort = sort.trim();

      const response = await api.get('/products', { params });
      if (response.data && response.data.products) {
        setProducts(response.data.products);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      const code = err.statusCode || err.response?.status;
      const msg = err.response?.data?.message || 'Something went wrong while loading products.';
      setError(code ? `[HTTP ${code}] ${msg}` : msg);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  // Debounce search / auto-fetch on state change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleCategorySelect = (selectedCat) => {
    const nextCat = selectedCat === 'All' || selectedCat === 'All Categories' ? '' : selectedCat;
    const updated = {};
    if (nextCat) updated.category = nextCat;
    if (search.trim()) updated.search = search.trim();
    if (sort.trim()) updated.sort = sort.trim();
    setSearchParams(updated, { replace: true });
  };

  const handleSortSelect = (selectedSort) => {
    const updated = {};
    if (category.trim() && category.toLowerCase() !== 'all') updated.category = category.trim();
    if (search.trim()) updated.search = search.trim();
    if (selectedSort.trim()) updated.sort = selectedSort.trim();
    setSearchParams(updated, { replace: true });
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="catalog-container">
        {/* Header Hero */}
        <div className="catalog-header animate-fade-in-up">
          <div className="catalog-header-badge">
            <Sparkles size={14} /> Streia Collection
          </div>
          <h1 className="catalog-title">Explore Our Catalog</h1>
          <p className="catalog-subtitle">
            Curated electronics, designer fashion, best-selling literature, and modern home essentials.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="animate-fade-in-up animate-delay-1">
          <SearchBar
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={handleCategorySelect}
            sort={sort}
            setSort={handleSortSelect}
            onSearchSubmit={fetchProducts}
          />

          {/* Quick Category Filter Pills */}
          <div className="category-pills-bar">
            <span className="category-pills-label">
              <Filter size={14} /> Quick Filter:
            </span>
            {QUICK_CATEGORIES.map((cat) => {
              const isActive =
                cat === 'All'
                  ? !category || category.toLowerCase() === 'all'
                  : category.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info Bar */}
        {!loading && !error && (
          <div className="results-info-bar">
            <span>
              Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
              {category && ` in "${category}"`}
              {search && ` matching "${search}"`}
            </span>
            {(search || category || sort) && (
              <button
                type="button"
                className="btn-link-reset"
                onClick={handleClearFilters}
              >
                Reset all filters
              </button>
            )}
          </div>
        )}

        {/* STATE: Loading */}
        {loading && (
          <div className="state-container loading-state">
            <div className="spinner-large"></div>
            <p className="state-message">Loading products...</p>
          </div>
        )}

        {/* STATE: Error */}
        {!loading && error && (
          <div className="state-container error-state">
            <div className="state-icon-wrapper error">
              <AlertCircle size={36} />
            </div>
            <h3 className="state-title">Error Loading Catalog</h3>
            <p className="state-message">{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '0.75rem 2rem' }}
              onClick={fetchProducts}
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        )}

        {/* STATE: Empty */}
        {!loading && !error && products.length === 0 && (
          <div className="state-container empty-state">
            <div className="state-icon-wrapper empty">
              <PackageX size={40} />
            </div>
            <h3 className="state-title">No products found.</h3>
            <p className="state-message">
              We couldn't find any products matching your current search or category filter.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '0.75rem 2rem' }}
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* STATE: Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                initialWishlisted={wishlistIds.has(product._id)}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Products;
