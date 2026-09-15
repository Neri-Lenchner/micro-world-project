import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import { TOKEN_KEY } from "./api/authApi";

function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export default function App() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/login");
  }

  return (
    <div className="app">
      <nav className="nav">
        <Link to="/">Home</Link>
        {!authenticated && <Link to="/login">Login</Link>}
        {!authenticated && <Link to="/register">Register</Link>}
        {authenticated && (
          <button className="link-button" onClick={logout}>
            Logout
          </button>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
