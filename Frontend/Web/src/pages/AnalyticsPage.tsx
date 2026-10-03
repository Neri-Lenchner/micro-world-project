import { useEffect, useState } from "react";
import { analyticsApi } from "../api/analyticsApi";
import { AnalyticsSummary } from "../types/analytics";
import { formatCount, formatPrice } from "../utils/format";
import "./AnalyticsPage.css";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsApi
      .summary()
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load analytics"));
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
    </div>
  );
}
