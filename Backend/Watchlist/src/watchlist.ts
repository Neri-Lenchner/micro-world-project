import {RowDataPacket} from "mysql2";

export interface WatchlistItemRow extends RowDataPacket {
    user_id: number;
    product_id: number;
    created_at: Date;
}

// What the API returns (camelCase, like the rest of the JSON the frontend sees).
export interface WatchlistItem {
    productId: number;
    createdAt: Date;
}

export function toWatchlistItem(row: WatchlistItemRow): WatchlistItem {
    return {
        productId: row.product_id,
        createdAt: row.created_at,
    };
}
