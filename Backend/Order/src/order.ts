import {RowDataPacket} from "mysql2";

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderRow extends RowDataPacket {
    id: number;
    product_id: number;
    product_title: string | null;
    price: number | null;
    buyer_id: number;
    buyer_email: string;
    seller_id: number | null;
    seller_email: string | null;
    status: OrderStatus;
    created_at: Date;
    updated_at: Date;
}

// What the API returns (camelCase, like the rest of the JSON the frontend sees).
export interface Order {
    id: number;
    productId: number;
    productTitle: string | null;
    price: number | null;
    buyerId: number;
    buyerEmail: string;
    sellerId: number | null;
    sellerEmail: string | null;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

export function toOrder(row: OrderRow): Order {
    return {
        id: row.id,
        productId: row.product_id,
        productTitle: row.product_title,
        price: row.price,
        buyerId: row.buyer_id,
        buyerEmail: row.buyer_email,
        sellerId: row.seller_id,
        sellerEmail: row.seller_email,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
