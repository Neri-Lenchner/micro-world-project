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
        <h1>Buy and sell, and watch it happen</h1>
        <p>A marketplace built to make its own architecture visible — every order moves through the services that own it, in real time.</p>
        {!user && <p className="muted">Sign in or create an account to start selling.</p>}
        <div className="actions">
          <Link to="/products" className="button">Browse listings</Link>
          <Link to="/sell" className="button secondary">Sell an item</Link>
        </div>
      </section>

      {latest.length > 0 && (
        <section>
          <div className="latest-heading">
            <h2>Latest listings</h2>
            <Link to="/products" className="see-all-link">See all →</Link>
          </div>
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
