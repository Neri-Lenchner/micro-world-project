export const CONDITIONS = ["new", "used"] as const;
export type Condition = typeof CONDITIONS[number];
export type ProductStatus = "available" | "sold";

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: Condition;
  imageUrl: string | null;
  sellerId: number;
  sellerEmail: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

// What the Sell / Edit form sends.
export interface ProductInput {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: Condition;
  imageUrl: string | null;
}

export type ProductSort = "newest" | "price_asc" | "price_desc";

export interface ProductFilters {
  search?: string;
  category?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
