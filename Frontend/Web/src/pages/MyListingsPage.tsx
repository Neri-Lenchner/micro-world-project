import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import { Product } from "../types/product";
import { capitalize, formatDate, formatPrice } from "../utils/format";
import ProductImage from "../components/ProductImage";
import "./MyListingsPage.css";

export default function MyListingsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    productsApi
      .getMine()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load your listings"));
  }, []);

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.title}"? This can't be undone.`)) return;
    setDeletingId(product.id);
    setError(null);
    try {
      await productsApi.remove(product.id);
      setProducts((current) => current?.filter((p) => p.id !== product.id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>My listings</h1>
        <Link to="/sell" className="button">+ Sell an item</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {!products && !error && <p className="muted">Loading…</p>}

      {products && products.length === 0 && (
        <div className="empty-state">
          <p>You're not selling anything yet.</p>
          <Link to="/sell" className="button">Sell your first item</Link>
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
                  {capitalize(product.category)} · {capitalize(product.condition)} · Listed {formatDate(product.createdAt)}
                </p>
              </div>
              <div className="actions">
                <Link to={`/products/${product.id}/edit`} className="button secondary">Edit</Link>
                <button className="danger" onClick={() => handleDelete(product)} disabled={deletingId === product.id}>
                  {deletingId === product.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
