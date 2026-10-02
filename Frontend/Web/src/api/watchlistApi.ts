import { http } from "./http";
import { WatchlistItem } from "../types/watchlist";

const BASE_URL = "/api/watchlist";

class WatchlistApi {
  add(productId: number): Promise<void> {
    return http<void>(`${BASE_URL}/${productId}`, { method: "POST" });
  }

  remove(productId: number): Promise<void> {
    return http<void>(`${BASE_URL}/${productId}`, { method: "DELETE" });
  }

  list(): Promise<WatchlistItem[]> {
    return http<WatchlistItem[]>(BASE_URL);
  }
}

export const watchlistApi = new WatchlistApi();
