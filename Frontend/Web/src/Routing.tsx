import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import SellPage from "./pages/SellPage";
import EditProductPage from "./pages/EditProductPage";
import MyListingsPage from "./pages/MyListingsPage";
import OrdersPage from "./pages/OrdersPage";
import WatchlistPage from "./pages/WatchlistPage";
import NotificationsPage from "./pages/NotificationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function Routing() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailsPage />} />
      <Route path="/products/:id/edit" element={<ProtectedRoute><EditProductPage /></ProtectedRoute>} />
      <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
      <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
