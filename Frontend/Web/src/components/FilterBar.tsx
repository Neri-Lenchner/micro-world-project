import { FormEvent, useState } from "react";
import { CONDITIONS, ProductFilters } from "../types/product";
import { capitalize } from "../utils/format";
import "./FilterBar.css";

interface Props {
  filters: ProductFilters;
  categories: string[];
  onChange: (changes: Partial<ProductFilters>) => void;
  onClear: () => void;
}

// Dropdowns/radios apply immediately; the text/price boxes apply when you press Search (or
// Enter), so we don't call the server on every keystroke.
export default function FilterBar({ filters, categories, onChange, onClear }: Props) {
  const [search, setSearch] = useState(filters.search ?? "");
  const [minPrice, setMinPrice] = useState(filters.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onChange({ search, minPrice, maxPrice });
  }

  return (
    <form className="browse-filters" onSubmit={handleSubmit}>
      <div className="search-row">
        <input
          type="search"
          placeholder="Search listings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-search"
          aria-label="Search listings"
        />
        <select
          value={filters.sort ?? "newest"}
          onChange={(e) => onChange({ sort: e.target.value as ProductFilters["sort"] })}
          aria-label="Sort"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
        <button type="submit">Search</button>
      </div>

      <aside className="filter-sidebar">
        <fieldset className="filter-group">
          <legend>Category</legend>
          <label className="filter-radio">
            <input
              type="radio"
              name="category"
              checked={!filters.category}
              onChange={() => onChange({ category: "" })}
            />
            All categories
          </label>
          {categories.map((category) => (
            <label key={category} className="filter-radio">
              <input
                type="radio"
                name="category"
                checked={filters.category === category}
                onChange={() => onChange({ category })}
              />
              {capitalize(category)}
            </label>
          ))}
        </fieldset>

        <fieldset className="filter-group">
          <legend>Condition</legend>
          <div className="filter-chips">
            <label className={`filter-chip ${!filters.condition ? "checked" : ""}`}>
              <input
                type="radio"
                name="condition"
                checked={!filters.condition}
                onChange={() => onChange({ condition: "" })}
              />
              Any
            </label>
            {CONDITIONS.map((condition) => (
              <label key={condition} className={`filter-chip ${filters.condition === condition ? "checked" : ""}`}>
                <input
                  type="radio"
                  name="condition"
                  checked={filters.condition === condition}
                  onChange={() => onChange({ condition })}
                />
                {capitalize(condition)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="filter-group">
          <legend>Price (₪)</legend>
          <div className="filter-price-row">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              aria-label="Minimum price"
            />
            <span className="filter-price-sep">–</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="Maximum price"
            />
          </div>
        </fieldset>

        <button type="button" className="link-button filter-clear" onClick={onClear}>
          Clear all filters
        </button>
      </aside>
    </form>
  );
}
