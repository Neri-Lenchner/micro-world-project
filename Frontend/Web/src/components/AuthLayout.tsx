import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import "./AuthLayout.css";

interface Props {
  active: "login" | "register";
  returnTo: string;
  title: string;
  children: ReactNode;
}

export default function AuthLayout({ active, returnTo, title, children }: Props) {
  const query = returnTo === "/" ? "" : `?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <span className="auth-logo">MicroWorld</span>
        <p className="auth-tagline">
          A marketplace that shows its work: every order moves through the services that own it, in view.
        </p>
      </div>
      <div className="auth-panel">
        <div className="auth-tabs" role="tablist">
          <NavLink to={`/login${query}`} role="tab" aria-selected={active === "login"} className="auth-tab">
            Sign in
          </NavLink>
          <NavLink to={`/register${query}`} role="tab" aria-selected={active === "register"} className="auth-tab">
            Create account
          </NavLink>
        </div>
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}
