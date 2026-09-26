import React from 'react';

function SearchBar({ search, setSearch, category, setCategory, categories = [], sort = '', setSort }) {
  // Define custom category palette styles
  const getPillStyle = (catName) => {
    const lower = (catName || '').toLowerCase();
    if (lower.includes('electr')) return 'pill-blue';
    if (lower.includes('cloth') || lower.includes('wear')) return 'pill-red';
    if (lower.includes('foot') || lower.includes('shoe')) return 'pill-yellow';
    if (lower.includes('home') || lower.includes('kitchen')) return 'pill-yellow';
    if (lower.includes('book')) return 'pill-blue';
    return 'pill-neutral';
  };

  return (
    <div className="search-filter-section">
      {/* Top Search Input & Sort Row */}
      <div className="search-top-bar">
        <div className="search-input-wrapper">
          <span className="search-prefix-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products by name, specs or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="modern-search-input"
          />
          {search && (
            <button 
              type="button"
              className="btn-clear-search" 
              onClick={() => setSearch('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="sort-select-group">
          <select
            value={sort}
            onChange={(e) => setSort && setSort(e.target.value)}
            className="category-select sort-select-modern"
            aria-label="Sort products by price"
          >
            <option value="">Sort: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="category-pills-row">
        <button
          type="button"
          onClick={() => setCategory('')}
          className={`category-pill-btn ${category === '' ? 'pill-active-all' : ''}`}
        >
          All Items
        </button>

        {categories.map((cat) => {
          const isSelected = category === cat;
          const colorClass = getPillStyle(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(isSelected ? '' : cat)}
              className={`category-pill-btn ${colorClass} ${isSelected ? 'pill-active' : ''}`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SearchBar;
