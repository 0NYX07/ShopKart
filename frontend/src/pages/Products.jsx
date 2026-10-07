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
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch user's wishlist to accurately reflect saved items on initial render
  const fetchWishlistData = async () => {
    try {
      const res = await getWishlist();
      if (res.data && res.data.wishlist) {
        setWishlistIds(new Set(res.data.wishlist.map((item) => (item._id ? item._id.toString() : item.toString()))));
      }
    } catch {
      // Unauthenticated or network error -> leave empty
    }
  };

  useEffect(() => {
    fetchWishlistData();
  }, []);

  // Fetch products whenever search, category, or sort state changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(false);

      try {
        // Build params dynamically
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category.trim()) params.category = category.trim();
        if (sort.trim()) params.sort = sort.trim();

        const response = await getProducts(params);

        if (response.data && response.data.success) {
          setProducts(response.data.products);

          // Update available categories list dynamically from fetched products
          const fetchedCats = response.data.products.map(p => p.category);
          setCategories(prev => Array.from(new Set([...prev, ...fetchedCats])));
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, sort]);

  return (
    <div>
      <Navbar />

      <div className="products-container">
        <div className="products-header">
          <h2>Product Catalog</h2>
          <p>Explore our wide range of products</p>
        </div>

        {/* Search, Category & Sort Section */}
        <SearchBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          categories={categories}
          sort={sort}
          setSort={setSort}
        />

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            Loading products...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="error-state">
            Something went wrong while loading products.
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="empty-state">
            No products found.
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                initialInWishlist={wishlistIds.has(product._id?.toString())}
                onWishlistUpdate={fetchWishlistData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
