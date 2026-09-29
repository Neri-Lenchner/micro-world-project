import { FormEvent, useState } from "react";
import { CONDITIONS, ProductFilters } from "../types/product";
import { capitalize } from "../utils/format";

interface Props {
  filters: ProductFilters;
  categories: string[];
  onChange: (changes: Partial<ProductFilters>) => void;
  onClear: () => void;
}

// Dropdowns apply immediately; the text/price boxes apply when you press Search (or Enter),
// so we don't call the server on every keystroke.
export default function FilterBar({ filters, categories, onChange, onClear }: Props) {
  const [search, setSearch] = useState(filters.search ?? "");
  const [minPrice, setMinPrice] = useState(filters.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onChange({ search, minPrice, maxPrice });
  }

  return (
    <form className="filter-bar" onSubmit={handleSubmit}>
      <input
        type="search"
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="filter-search"
      />
      <select value={filters.category ?? ""} onChange={(e) => onChange({ category: e.target.value })}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>{capitalize(category)}</option>
        ))}
      </select>
      <select value={filters.condition ?? ""} onChange={(e) => onChange({ condition: e.target.value })}>
        <option value="">Any condition</option>
        {CONDITIONS.map((condition) => (
          <option key={condition} value={condition}>{capitalize(condition)}</option>
        ))}
      </select>
      <input
        type="number"
        min="0"
        placeholder="Min ₪"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className="filter-price"
      />
      <input
        type="number"
        min="0"
        placeholder="Max ₪"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className="filter-price"
      />
      <select value={filters.sort ?? "newest"} onChange={(e) => onChange({ sort: e.target.value as ProductFilters["sort"] })}>
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
      <button type="submit">Search</button>
      <button type="button" className="secondary" onClick={onClear}>Clear</button>
    </form>
  );
}
