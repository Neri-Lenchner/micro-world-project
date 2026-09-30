import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import { useCurrentUser } from "../auth/auth";
import { Product } from "../types/product";
import ProductForm from "../components/ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productsApi
      .getById(id!)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load product"));
  }, [id]);

  if (error) {
    return (
      <div className="empty-state">
        <p className="error">{error}</p>
        <Link to="/my-listings">← Back to My listings</Link>
      </div>
    );
  }
  if (!product) return <p className="muted">Loading…</p>;

  // The server checks this too; here it's just to show a friendly message.
  if (product.sellerId !== user?.id) {
    return (
      <div className="empty-state">
        <p className="error">You can only edit your own products.</p>
        <Link to={`/products/${product.id}`}>← Back to the product</Link>
      </div>
    );
  }

  return (
    <div className="form-page">
      <h1>Edit item</h1>
      <ProductForm
        initial={product}
        submitLabel="Save changes"
        onSubmit={async (input, image) => {
          await productsApi.update(product.id, input, image);
          navigate(`/products/${product.id}`);
        }}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
