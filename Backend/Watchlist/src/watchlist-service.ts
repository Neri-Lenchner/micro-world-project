import {ResourceNotFound, CurrentUser} from "@nltech/rest";
import {dal} from "./dal";
import {WatchlistItem, WatchlistItemRow, toWatchlistItem} from "./watchlist";

class WatchlistService {

    public async add(productId: string, user: CurrentUser): Promise<void> {
        const numericId = this.parseId(productId);
        await dal.pool.query(
            "INSERT IGNORE INTO watchlist_items (user_id, product_id) VALUES (?, ?)",
            [user.id, numericId]
        );
    }

    public async remove(productId: string, user: CurrentUser): Promise<void> {
        const numericId = this.parseId(productId);
        await dal.pool.query(
            "DELETE FROM watchlist_items WHERE user_id = ? AND product_id = ?",
            [user.id, numericId]
        );
    }

    public async list(user: CurrentUser): Promise<WatchlistItem[]> {
        const [rows] = await dal.pool.query<WatchlistItemRow[]>(
            "SELECT * FROM watchlist_items WHERE user_id = ? ORDER BY created_at DESC", [user.id]
        );
        return rows.map(toWatchlistItem);
    }

    private parseId(id: string): number {
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) throw new ResourceNotFound(id);
        return numericId;
    }
}

export const watchlistService = new WatchlistService();
