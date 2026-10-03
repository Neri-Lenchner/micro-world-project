import { http } from "./http";
import { Order } from "../types/order";

const BASE_URL = "/api/orders";

class OrdersApi {
  create(productId: number): Promise<Order> {
    return http<Order>(BASE_URL, { method: "POST", body: { productId } });
  }

  // "selling" = orders for things I sold; omitted = things I bought.
  list(role?: "selling"): Promise<Order[]> {
    return http<Order[]>(role ? `${BASE_URL}?role=${role}` : BASE_URL);
  }

  getById(id: number): Promise<Order> {
    return http<Order>(`${BASE_URL}/${id}`);
  }

  updateStatus(id: number, status: "SHIPPED" | "DELIVERED"): Promise<Order> {
    return http<Order>(`${BASE_URL}/${id}/status`, { method: "PUT", body: { status } });
  }
}

export const ordersApi = new OrdersApi();
