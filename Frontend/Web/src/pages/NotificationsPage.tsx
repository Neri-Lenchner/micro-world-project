import { useEffect, useState } from "react";
import { notificationsApi } from "../api/notificationsApi";
import { Notification } from "../types/notification";
import { formatDate } from "../utils/format";
import "./NotificationsPage.css";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    notificationsApi
      .list()
      .then(setNotifications)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load notifications"));
  }, []);

  async function handleMarkRead(notification: Notification) {
    if (notification.read) return;
    setNotifications((current) => current?.map((n) => (n.id === notification.id ? { ...n, read: true } : n)) ?? null);
    await notificationsApi.markRead(notification.id).catch(() => undefined);
  }

  async function handleMarkAllRead() {
    setNotifications((current) => current?.map((n) => ({ ...n, read: true })) ?? null);
    await notificationsApi.markAllRead().catch(() => undefined);
  }

  const hasUnread = notifications?.some((n) => !n.read) ?? false;

  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        {hasUnread && <button className="secondary" onClick={handleMarkAllRead}>Mark all as read</button>}
      </div>

      {error && <p className="error">{error}</p>}
      {!notifications && !error && <p className="muted">Loading…</p>}

      {notifications && notifications.length === 0 && (
        <div className="empty-state">
          <p>No notifications yet.</p>
        </div>
      )}

      {notifications && notifications.length > 0 && (
        <ul className="notifications">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={notification.read ? "notification-row" : "notification-row unread"}
              onClick={() => handleMarkRead(notification)}
            >
              <span className="notification-dot" />
              <div className="notification-body">
                <p>{notification.message}</p>
                <p className="muted">{formatDate(notification.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
