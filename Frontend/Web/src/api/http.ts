import { clearToken, getToken } from "../auth/auth";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.error ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

// Small fetch wrapper: sends JSON, adds the login token, and turns error responses into ApiError.
export async function http<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    // We sent a token and the server rejected it (e.g. expired): log out and go to the login page.
    if (response.status === 401 && token) {
      clearToken();
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/login?returnTo=${returnTo}`);
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
