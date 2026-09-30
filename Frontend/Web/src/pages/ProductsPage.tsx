import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import { Paged, Product, ProductFilters } from "../types/product";
import ProductCard from "../components/ProductCard";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import "./ProductsPage.css";

const PAGE_SIZE = 12;

// The filters live in the URL (?search=guitar&category=music&page=2), so the page can be
// shared as a link and the browser's Back button returns to the previous search.
function readFilters(params: URLSearchParams): ProductFilters {
  return {
    search: params.get("search") ?? undefined,
    category: params.get("category") ?? undefined,
    condition: params.get("condition") ?? undefined,
    minPrice: params.get("minPrice") ?? undefined,
    maxPrice: params.get("maxPrice") ?? undefined,
    sort: (params.get("sort") as ProductFilters["sort"]) ?? undefined,
    page: Number(params.get("page")) || 1,
  };
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const queryKey = searchParams.toString();

  const [categories, setCategories] = useState<string[]>([]);
  const [result, setResult] = useState<Paged<Product> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let ignore = false; // Drop the answer if the filters changed while we were waiting.
    setLoading(true);
    setError(null);
    productsApi
      .list({ ...readFilters(new URLSearchParams(queryKey)), limit: PAGE_SIZE })
      .then((data) => !ignore && setResult(data))
      .catch((err) => !ignore && setError(err instanceof Error ? err.message : "Failed to load products"))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [queryKey]);

  function updateFilters(changes: Partial<ProductFilters>, resetPage = true) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    }
    if (resetPage) next.delete("page");
    setSearchParams(next);
  }

  function goToPage(page: number) {
    updateFilters({ page }, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="browse-layout">
      <h1 className="browse-title">Browse</h1>
      <FilterBar
        key={queryKey}
        filters={filters}
        categories={categories}
        onChange={(changes) => updateFilters(changes)}
        onClear={() => setSearchParams({})}
      />

      <div className="browse-results">
        {error && <p className="error">{error}</p>}
        {loading && !result && <p className="muted">Loading…</p>}

        {result && (
          <>
            <p className="muted browse-count">
              {result.total} {result.total === 1 ? "item" : "items"} found
              {loading && " · updating…"}
            </p>
            {result.items.length === 0 ? (
              <div className="empty-state">
                <p>No products match your search.</p>
                <button className="secondary" onClick={() => setSearchParams({})}>Clear filters</button>
              </div>
            ) : (
              <div className="product-grid">
                {result.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <Pagination page={result.page} pages={result.pages} onChange={goToPage} />
          </>
        )}
      </div>
    </div>
  );
}
