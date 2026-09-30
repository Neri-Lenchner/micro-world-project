import { http } from "./http";
import { Paged, Product, ProductFilters, ProductInput } from "../types/product";

const BASE_URL = "/api/products";

function toFormData(input: ProductInput, image?: File | null): FormData {
  const form = new FormData();
  form.append("title", input.title);
  form.append("description", input.description);
  form.append("price", String(input.price));
  form.append("category", input.category);
  form.append("condition", input.condition);
  form.append("imageUrl", input.imageUrl ?? "");
  if (image) form.append("image", image);
  return form;
}

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

  // `image` is a newly picked photo; without one, input.imageUrl is kept (or removed if null).
  create(input: ProductInput, image?: File | null): Promise<Product> {
    return http<Product>(BASE_URL, { method: "POST", body: toFormData(input, image) });
  }

  update(id: string | number, input: ProductInput, image?: File | null): Promise<Product> {
    return http<Product>(`${BASE_URL}/${id}`, { method: "PUT", body: toFormData(input, image) });
  }

  remove(id: string | number): Promise<void> {
    return http<void>(`${BASE_URL}/${id}`, { method: "DELETE" });
  }
}

export const productsApi = new ProductsApi();
