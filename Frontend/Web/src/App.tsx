import { Link, useNavigate } from "react-router-dom";
import Routing from "./Routing";
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
      <Routing />
    </div>
  );
}
