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
        <Link to="/" className="brand" aria-label="MicroWorld home">
          <img src="/logo.svg" alt="MicroWorld" height={28} />
        </Link>
        <ul className="nav-links">
          <li><NavLink to="/products" end>Browse</NavLink></li>
          {user && (
            <>
              <li><NavLink to="/my-listings">My listings</NavLink></li>
              <li><NavLink to="/orders">Orders</NavLink></li>
              <li><NavLink to="/watchlist">Watchlist</NavLink></li>
            </>
          )}
        </ul>
        <span className="nav-spacer" />
        <div className="nav-account">
          {user ? (
            <>
              <span className="nav-user">{user.email}</span>
              <button className="link-button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Sign in</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
          <Link to="/sell" className="button">Sell an item</Link>
        </div>
      </nav>
      <Routing />
    </div>
  );
}
