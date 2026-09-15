import { TOKEN_KEY } from "../api/authApi";

export default function HomePage() {
  const token = localStorage.getItem(TOKEN_KEY);

  return (
    <div className="form-page">
      <h1>JB Web</h1>
      {token ? (
        <p>You are logged in.</p>
      ) : (
        <p>You are not logged in. Use Login or Register above.</p>
      )}
    </div>
  );
}
