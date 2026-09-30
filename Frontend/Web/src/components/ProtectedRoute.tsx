import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "../auth/auth";

// Pages that need a logged-in user. Guests are sent to /login and come back here afterwards.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const location = useLocation();

  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }
  return <>{children}</>;
}
