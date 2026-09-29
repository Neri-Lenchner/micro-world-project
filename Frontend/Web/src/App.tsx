import { Link, NavLink, useNavigate } from "react-router-dom";
import Routing from "./Routing";
import { clearToken, useCurrentUser } from "./auth/auth";

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
        <NavLink to="/products">Browse</NavLink>
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
