import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/ordersApi";
import { Order } from "../types/order";
import { formatDate, formatPrice } from "../utils/format";
import "./OrdersPage.css";

const STATUS_LABEL: Record<Order["status"], string> = {
  PENDING: "Pending",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export default function OrdersPage() {
  const [tab, setTab] = useState<"buying" | "selling">("buying");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    setOrders(null);
    setError(null);
    load();
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function load() {
    ordersApi
      .list(tab === "selling" ? "selling" : undefined)
      .then((data) => {
        setOrders(data);
        if (data.some((o) => o.status === "PENDING")) startPolling();
        else stopPolling();
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"));
  }

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(load, 1500);
  }

  function stopPolling() {
    if (!pollRef.current) return;
    clearInterval(pollRef.current);
    pollRef.current = undefined;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
      </div>

      <div className="tabs">
        <button className={tab === "buying" ? "tab active" : "tab"} onClick={() => setTab("buying")}>
          Purchases
        </button>
        <button className={tab === "selling" ? "tab active" : "tab"} onClick={() => setTab("selling")}>
          Sales
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {!orders && !error && <p className="muted">Loading…</p>}

      {orders && orders.length === 0 && (
        <div className="empty-state">
          <p>{tab === "buying" ? "You haven't bought anything yet." : "You haven't sold anything yet."}</p>
          <Link to="/products" className="button">Browse listings</Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <ul className="listings">
          {orders.map((order) => (
            <li key={order.id} className="listing-row">
              <div className="listing-info">
                {order.productTitle ? (
                  <Link to={`/products/${order.productId}`} className="listing-title">{order.productTitle}</Link>
                ) : (
                  <span className="listing-title muted">Order #{order.id}</span>
                )}
                <p className="price">{order.price !== null ? formatPrice(order.price) : "—"}</p>
                <p className="muted">
                  {tab === "buying" ? `Sold by ${order.sellerEmail ?? "…"}` : `Bought by ${order.buyerEmail}`} · {formatDate(order.createdAt)}
                </p>
              </div>
              <span className={`tag status-${order.status.toLowerCase()}`}>{STATUS_LABEL[order.status]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
