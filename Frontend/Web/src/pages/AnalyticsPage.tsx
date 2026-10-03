import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { analyticsApi } from "../api/analyticsApi";
import { AnalyticsSummary } from "../types/analytics";
import { formatCount, formatPrice } from "../utils/format";
import "./AnalyticsPage.css";

interface LiveEvent {
  key: string;
  status: string;
  productTitle: string;
  price: number | null;
  at: string;
}

const MAX_EVENTS = 15;

const STATUS_LABEL: Record<string, string> = {
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsApi
      .summary()
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load analytics"));
  }, []);

  // A public, anonymized feed of order events as they happen elsewhere on the site -
  // the architecture literally made visible, not just described.
  useEffect(() => {
    const socket = io();
    socket.on("order-event", (event: Omit<LiveEvent, "key">) => {
      setEvents((current) => [{ ...event, key: `${event.at}-${Math.random()}` }, ...current].slice(0, MAX_EVENTS));
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Analytics</h1>
      </div>

      {error && <p className="error">{error}</p>}
      {!summary && !error && <p className="muted">Loading…</p>}

      {summary && (
        <div className="stat-grid">
          <div className="stat-tile">
            <p className="stat-label">Orders placed</p>
            <p className="stat-value">{formatCount(summary.ordersPlaced)}</p>
          </div>
          <div className="stat-tile">
            <p className="stat-label">Total revenue</p>
            <p className="stat-value">{formatPrice(summary.totalRevenue)}</p>
          </div>
          <div className="stat-tile">
            <p className="stat-label">Average order value</p>
            <p className="stat-value">{formatPrice(summary.averageOrderValue)}</p>
          </div>
          <div className="stat-tile">
            <p className="stat-label">Paid</p>
            <p className="stat-value">{formatCount(summary.paidCount)}</p>
          </div>
          <div className="stat-tile">
            <p className="stat-label">Shipped</p>
            <p className="stat-value">{formatCount(summary.shippedCount)}</p>
          </div>
          <div className="stat-tile">
            <p className="stat-label">Delivered</p>
            <p className="stat-value">{formatCount(summary.deliveredCount)}</p>
          </div>
          <div className="stat-tile">
            <p className="stat-label">Cancelled</p>
            <p className="stat-value">{formatCount(summary.cancelledCount)}</p>
          </div>
        </div>
      )}

      <div className="live-feed">
        <div className="live-feed-header">
          <h2>Live events</h2>
          <span className="live-dot" aria-hidden="true" />
        </div>
        {events.length === 0 ? (
          <p className="muted">Waiting for activity — buy, ship, or deliver something to see it appear here.</p>
        ) : (
          <ul className="live-feed-list">
            {events.map((event) => (
              <li key={event.key} className="live-feed-row">
                <span className={`tag status-${event.status.toLowerCase()}`}>{STATUS_LABEL[event.status] ?? event.status}</span>
                <span className="live-feed-detail">
                  "{event.productTitle}"{event.price !== null && ` · ${formatPrice(event.price)}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
