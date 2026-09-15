const BASE_URL = "/api/auth";
export const TOKEN_KEY = "jb_token";

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.error ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

class AuthApi {
  async register(email: string, password: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error(await parseErrorMessage(response));
    // Unlike /login, the register endpoint responds with the raw token string, not { token }.
    return (await response.json()) as string;
  }

  async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error(await parseErrorMessage(response));
    const data = await response.json();
    return data.token as string;
  }
}

export const authApi = new AuthApi();
