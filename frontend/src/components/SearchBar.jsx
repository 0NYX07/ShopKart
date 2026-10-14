import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Books',
  'Home',
];

const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

const SearchBar = ({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  onSearchSubmit,
}) => {
  return (
    <div className="filter-bar-container">
      {/* Search Bar */}
      <form
        className="search-input-wrapper"
        onSubmit={(e) => {
          e.preventDefault();
          if (onSearchSubmit) onSearchSubmit();
        }}
      >
        <Search size={18} className="search-icon" />
        <input
          type="text"
          id="product-search-input"
          className="search-input"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setSearch('')}
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Filters Group */}
      <div className="filters-controls-group">
        {/* Category Dropdown */}
        <div className="select-wrapper">
          <SlidersHorizontal size={16} className="select-icon" />
          <select
            id="category-filter-select"
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown (Bonus Challenge) */}
        <div className="select-wrapper">
          <ArrowUpDown size={16} className="select-icon" />
          <select
            id="sort-filter-select"
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
