import {beforeAll, describe, expect, it} from "vitest";
import {createListing, registerAndLogin, request, waitForGateway} from "./helpers";

beforeAll(() => waitForGateway());

describe("Catalog", () => {
    it("creates a listing and reads it back", async () => {
        const seller = await registerAndLogin("catalog-seller");
        const productId = await createListing(seller.token, {title: "Catalog Round-Trip Item", price: "42"});

        const result = await request(`/api/products/${productId}`);
        expect(result.status).toBe(200);
        expect(result.body.title).toBe("Catalog Round-Trip Item");
        expect(result.body.price).toBe(42);
        expect(result.body.sellerEmail).toBe(seller.email);
        expect(result.body.status).toBe("available");
    });

    it("rejects creating a listing while logged out", async () => {
        const form = new FormData();
        form.set("title", "Should Not Be Created");
        form.set("description", "x");
        form.set("price", "1");
        form.set("category", "other");
        form.set("condition", "used");

        const response = await fetch(`${process.env.GATEWAY_URL ?? "http://localhost:8081"}/api/products`, {
            method: "POST",
            body: form,
        });
        expect(response.status).toBe(401);
    });

    it("only the owner can delete a listing", async () => {
        const seller = await registerAndLogin("catalog-owner");
        const other = await registerAndLogin("catalog-intruder");
        const productId = await createListing(seller.token);

        const blocked = await request(`/api/products/${productId}`, {method: "DELETE", token: other.token});
        expect(blocked.status).toBe(403);

        const allowed = await request(`/api/products/${productId}`, {method: "DELETE", token: seller.token});
        expect(allowed.status).toBe(204);
    });
});
