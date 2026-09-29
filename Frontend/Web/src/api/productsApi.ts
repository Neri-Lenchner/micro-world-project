import { http } from "./http";
import { Paged, Product, ProductFilters, ProductInput } from "../types/product";

const BASE_URL = "/api/products";

class ProductsApi {
  list(filters: ProductFilters = {}): Promise<Paged<Product>> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
    const query = params.toString();
    return http<Paged<Product>>(query ? `${BASE_URL}?${query}` : BASE_URL);
  }

  categories(): Promise<string[]> {
    return http<string[]>(`${BASE_URL}/categories`);
  }

  getById(id: string | number): Promise<Product> {
    return http<Product>(`${BASE_URL}/${id}`);
  }

  getMine(): Promise<Product[]> {
    return http<Product[]>(`${BASE_URL}/mine`);
  }

  create(input: ProductInput): Promise<Product> {
    return http<Product>(BASE_URL, { method: "POST", body: input });
  }

  update(id: string | number, input: ProductInput): Promise<Product> {
    return http<Product>(`${BASE_URL}/${id}`, { method: "PUT", body: input });
  }

  remove(id: string | number): Promise<void> {
    return http<void>(`${BASE_URL}/${id}`, { method: "DELETE" });
  }
}

export const productsApi = new ProductsApi();
