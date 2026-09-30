import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import { useCurrentUser } from "../auth/auth";
import { Product } from "../types/product";
import ProductCard from "../components/ProductCard";
import "./HomePage.css";

export default function HomePage() {
  const user = useCurrentUser();
  const [latest, setLatest] = useState<Product[]>([]);

  useEffect(() => {
    productsApi
      .list({ sort: "newest", limit: 4 })
      .then((data) => setLatest(data.items))
      .catch(() => setLatest([]));
  }, []);

  return (
    <div>
      <section className="hero">
        <h1>MicroWorld</h1>
        <p>Buy and sell second-hand and new items.</p>
        {!user && <p className="muted">Log in or register to start selling.</p>}
        <div className="actions">
          <Link to="/products" className="button">Browse products</Link>
          <Link to="/sell" className="button secondary">Sell an item</Link>
        </div>
      </section>

      {latest.length > 0 && (
        <section>
          <h2>Latest listings</h2>
          <div className="product-grid">
            {latest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
