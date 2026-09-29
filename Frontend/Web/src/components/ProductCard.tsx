import { Link } from "react-router-dom";
import { Product } from "../types/product";
import { capitalize, formatPrice } from "../utils/format";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <ProductImage src={product.imageUrl} alt={product.title} />
      <div className="product-card-body">
        <h3>{product.title}</h3>
        <p className="price">{formatPrice(product.price)}</p>
        <p className="muted">
          {capitalize(product.category)} · {capitalize(product.condition)}
        </p>
      </div>
    </Link>
  );
}
