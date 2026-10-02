import {RowDataPacket} from "mysql2";

export const CATEGORIES = ["electronics", "music", "home", "fashion", "sports", "books", "other"] as const;
export const CONDITIONS = ["new", "used"] as const;

export type Category = typeof CATEGORIES[number];
export type Condition = typeof CONDITIONS[number];
export type ProductStatus = "available" | "sold";

export interface ProductRow extends RowDataPacket {
    id: number;
    title: string;
    description: string;
    price: number;
    category: Category;
    condition: Condition;
    image_url: string | null;
    seller_id: number;
    seller_email: string;
    status: ProductStatus;
    created_at: Date;
    updated_at: Date;
}

// What a seller sends when creating or updating a product.
export interface ProductInput {
    title: string;
    description: string;
    price: number;
    category: Category;
    condition: Condition;
    imageUrl: string | null;
}

// What the API returns (camelCase, like the rest of the JSON the frontend sees).
export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    category: Category;
    condition: Condition;
    imageUrl: string | null;
    sellerId: number;
    sellerEmail: string;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
}

export function toProduct(row: ProductRow): Product {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price,
        category: row.category,
        condition: row.condition,
        imageUrl: row.image_url,
        sellerId: row.seller_id,
        sellerEmail: row.seller_email,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
