import { Link } from "react-router-dom";
import { Product } from "../types/product";
import { capitalize, formatPrice } from "../utils/format";
import ProductImage from "./ProductImage";
import "./ProductCard.css";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-media">
        <ProductImage src={product.imageUrl} alt={product.title} />
        <span className="condition-badge">{capitalize(product.condition)}</span>
      </div>
      <div className="product-card-body">
        <h3>{product.title}</h3>
        <p className="price">{formatPrice(product.price)}</p>
        <p className="muted">
          {product.sellerEmail} · {capitalize(product.category)}
        </p>
      </div>
    </Link>
  );
}
