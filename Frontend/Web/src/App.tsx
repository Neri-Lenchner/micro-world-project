import { Link, NavLink, useNavigate } from "react-router-dom";
import Routing from "./Routing";
import { clearToken, useCurrentUser } from "./auth/auth";
import "./App.css";

export default function App() {
  const navigate = useNavigate();
  const user = useCurrentUser();

  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="app">
      <nav className="nav">
        <Link to="/" className="brand">MicroWorld</Link>
        <NavLink to="/products" end>Browse</NavLink>
        {user && <NavLink to="/sell">Sell</NavLink>}
        {user && <NavLink to="/my-listings">My listings</NavLink>}
        <span className="nav-spacer" />
        {!user && <NavLink to="/login">Login</NavLink>}
        {!user && <NavLink to="/register">Register</NavLink>}
        {user && <span className="nav-user">{user.email}</span>}
        {user && (
          <button className="link-button" onClick={logout}>
            Logout
          </button>
        )}
      </nav>
      <Routing />
    </div>
  );
}
