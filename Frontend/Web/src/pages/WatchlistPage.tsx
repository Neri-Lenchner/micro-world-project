import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import { watchlistApi } from "../api/watchlistApi";
import { useWatchlist } from "../watchlist/WatchlistContext";
import { Product } from "../types/product";
import { capitalize, formatPrice } from "../utils/format";
import ProductImage from "../components/ProductImage";

export default function WatchlistPage() {
  const { toggle } = useWatchlist();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    watchlistApi
      .list()
      // A saved product that was since deleted just drops out of the view.
      .then((items) => Promise.all(items.map((item) => productsApi.getById(item.productId).catch(() => null))))
      .then((results) => !ignore && setProducts(results.filter((p): p is Product => p !== null)))
      .catch((err) => !ignore && setError(err instanceof Error ? err.message : "Failed to load your watchlist"));
    return () => {
      ignore = true;
    };
  }, []);

  async function handleRemove(product: Product) {
    await toggle(product.id);
    setProducts((current) => current?.filter((p) => p.id !== product.id) ?? null);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Watchlist</h1>
      </div>

      {error && <p className="error">{error}</p>}
      {!products && !error && <p className="muted">Loading…</p>}

      {products && products.length === 0 && (
        <div className="empty-state">
          <p>You haven't saved anything yet.</p>
          <Link to="/products" className="button">Browse listings</Link>
        </div>
      )}

      {products && products.length > 0 && (
        <ul className="listings">
          {products.map((product) => (
            <li key={product.id} className="listing-row">
              <Link to={`/products/${product.id}`} className="listing-thumb">
                <ProductImage src={product.imageUrl} alt={product.title} />
              </Link>
              <div className="listing-info">
                <Link to={`/products/${product.id}`} className="listing-title">{product.title}</Link>
                <p className="price">{formatPrice(product.price)}</p>
                <p className="muted">
                  {product.sellerEmail} · {capitalize(product.category)}
                  {product.status === "sold" && " · Sold"}
                </p>
              </div>
              <div className="actions">
                <button className="secondary" onClick={() => handleRemove(product)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
