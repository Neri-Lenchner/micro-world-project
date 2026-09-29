import { http } from "./http";

const BASE_URL = "/api/auth";

class AuthApi {
  async register(email: string, password: string): Promise<string> {
    // Unlike /login, the register endpoint responds with the raw token string, not { token }.
    return http<string>(`${BASE_URL}/register/`, { method: "POST", body: { email, password } });
  }

  async login(email: string, password: string): Promise<string> {
    const data = await http<{ token: string }>(`${BASE_URL}/login/`, { method: "POST", body: { email, password } });
    return data.token;
  }
}

export const authApi = new AuthApi();
