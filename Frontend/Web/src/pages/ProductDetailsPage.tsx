import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import { ApiError } from "../api/http";
import { useCurrentUser } from "../auth/auth";
import { Product } from "../types/product";
import { capitalize, formatDate, formatPrice } from "../utils/format";
import ProductImage from "../components/ProductImage";
import "./ProductDetailsPage.css";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    setProduct(null);
    setError(null);
    productsApi
      .getById(id!)
      .then((data) => !ignore && setProduct(data))
      .catch((err) => {
        if (ignore) return;
        setError(err instanceof ApiError && err.status === 404 ? "This product doesn't exist (maybe it was deleted)." : err.message);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!product || !window.confirm(`Delete "${product.title}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await productsApi.remove(product.id);
      navigate("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  if (error && !product) {
    return (
      <div className="empty-state">
        <p className="error">{error}</p>
        <Link to="/products">← Back to Browse</Link>
      </div>
    );
  }
  if (!product) return <p className="muted">Loading…</p>;

  const isOwner = user?.id === product.sellerId;

  return (
    <div>
      <Link to="/products" className="back-link">← Back to Browse</Link>
      <div className="product-details">
        <ProductImage src={product.imageUrl} alt={product.title} className="large" />
        <div className="product-info">
          <h1>{product.title}</h1>
          <p className="price large">{formatPrice(product.price)}</p>
          <p>
            <span className="tag">{capitalize(product.category)}</span>
            <span className="tag">{capitalize(product.condition)}</span>
          </p>
          <p className="description">{product.description}</p>
          <p className="muted">
            Sold by {isOwner ? "you" : product.sellerEmail} · Listed {formatDate(product.createdAt)}
          </p>

          {error && <p className="error">{error}</p>}

          {isOwner ? (
            <div className="actions">
              <Link to={`/products/${product.id}/edit`} className="button secondary">Edit</Link>
              <button className="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          ) : (
            <div className="actions">
              <button disabled title="Buying is coming in the Orders step">Buy now (coming soon)</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
