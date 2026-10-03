export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

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
  createdAt: string;
  updatedAt: string;
}
