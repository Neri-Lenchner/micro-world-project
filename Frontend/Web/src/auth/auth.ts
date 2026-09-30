import { useSyncExternalStore } from "react";

const TOKEN_KEY = "jb_token";
const listeners = new Set<() => void>();

export interface CurrentUser {
  id: number;
  email: string;
}

interface TokenPayload {
  slimUser?: CurrentUser;
  exp?: number;
}

// Reads the JWT payload in the browser. This does NOT verify the token (only the
// backend can do that) - it's just to know who is logged in and when it expires.
function decodePayload(token: string): TokenPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function isExpired(payload: TokenPayload): boolean {
  return payload.exp !== undefined && payload.exp * 1000 <= Date.now();
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const payload = decodePayload(token);
  if (!payload || isExpired(payload)) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  notify();
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  notify();
}

export function getCurrentUser(): CurrentUser | null {
  const token = getToken();
  return token ? decodePayload(token)?.slimUser ?? null : null;
}

// Where to go after login/register (?returnTo=/sell). Only local paths are allowed,
// so a link like /login?returnTo=https://evil.com can't send users to another site.
export function getReturnTo(params: URLSearchParams): string {
  const returnTo = params.get("returnTo");
  return returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Also react to login/logout in another browser tab.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// Re-renders the component whenever the user logs in or out.
export function useCurrentUser(): CurrentUser | null {
  const token = useSyncExternalStore(subscribe, getToken);
  return token ? decodePayload(token)?.slimUser ?? null : null;
}
