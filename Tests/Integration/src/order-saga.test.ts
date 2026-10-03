import {beforeAll, describe, expect, it} from "vitest";
import {createListing, registerAndLogin, request, waitForGateway, waitForOrderResolved} from "./helpers";

beforeAll(() => waitForGateway());

describe("Order saga", () => {
    it("resolves a purchase to PAID or CANCELLED, never stays PENDING", async () => {
        const seller = await registerAndLogin("saga-seller");
        const buyer = await registerAndLogin("saga-buyer");
        const productId = await createListing(seller.token);

        const created = await request("/api/orders", {method: "POST", token: buyer.token, body: {productId}});
        expect(created.status).toBe(201);
        expect(created.body.status).toBe("PENDING");

        const resolved = await waitForOrderResolved(buyer.token, created.body.id);
        expect(["PAID", "CANCELLED"]).toContain(resolved.status);

        const product = await request(`/api/products/${productId}`);
        expect(product.body.status).toBe(resolved.status === "PAID" ? "sold" : "available");
    });

    it("a buyer can't buy the same thing twice without it ever becoming sold out appropriately", async () => {
        // Not a race test (see order-race.test.ts) - just confirms a second order on an
        // already-sold product gets rejected cleanly via reserve-failed, not silently paid.
        const seller = await registerAndLogin("saga-reorder-seller");
        const buyer = await registerAndLogin("saga-reorder-buyer");
        const productId = await createListing(seller.token);

        const first = await request("/api/orders", {method: "POST", token: buyer.token, body: {productId}});
        const firstResolved = await waitForOrderResolved(buyer.token, first.body.id);
        if (firstResolved.status !== "PAID") return; // payment declined this run - nothing to re-buy, not what this test is about

        const second = await request("/api/orders", {method: "POST", token: buyer.token, body: {productId}});
        const secondResolved = await waitForOrderResolved(buyer.token, second.body.id);
        expect(secondResolved.status).toBe("CANCELLED");
        expect(secondResolved.productTitle).toBeNull();
    });
});
