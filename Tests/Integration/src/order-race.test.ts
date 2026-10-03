import {beforeAll, describe, expect, it} from "vitest";
import {createListing, registerAndLogin, request, waitForGateway, waitForOrderResolved} from "./helpers";

beforeAll(() => waitForGateway());

describe("Order race condition", () => {
    // The one property the whole reserve/release design exists to guarantee: two buyers
    // hitting "Buy now" on the same listing at the same instant can never both win it.
    //
    // This can't be asserted as "one PAID, one CANCELLED" - Payment declines ~15% of the
    // time even for the buyer who legitimately won the reservation, which would make that
    // assertion flake. The deterministic, payment-independent signal is productTitle: it's
    // only ever filled in by stageReserved(), which only runs for the order that actually
    // won Catalog's atomic UPDATE - before payment is even attempted. So exactly one of the
    // two orders must have a non-null productTitle, regardless of what payment does next.
    it("lets exactly one of two concurrent buyers win the reservation", async () => {
        const seller = await registerAndLogin("race-seller");
        const buyerA = await registerAndLogin("race-buyer-a");
        const buyerB = await registerAndLogin("race-buyer-b");
        const productId = await createListing(seller.token, {title: "Race Condition Test Item"});

        const [orderA, orderB] = await Promise.all([
            request("/api/orders", {method: "POST", token: buyerA.token, body: {productId}}),
            request("/api/orders", {method: "POST", token: buyerB.token, body: {productId}}),
        ]);

        const [resolvedA, resolvedB] = await Promise.all([
            waitForOrderResolved(buyerA.token, orderA.body.id),
            waitForOrderResolved(buyerB.token, orderB.body.id),
        ]);

        const reservedCount = [resolvedA, resolvedB].filter((order) => order.productTitle !== null).length;
        expect(reservedCount).toBe(1);

        // The loser never got reserved, so it's always CANCELLED - no payment randomness
        // involved for that one.
        const loser = resolvedA.productTitle === null ? resolvedA : resolvedB;
        expect(loser.status).toBe("CANCELLED");

        // Whatever happened to the winner, the product itself must be internally consistent
        // with it: sold if the winner's payment was approved, available again if declined -
        // never left in some third, inconsistent state.
        const winner = resolvedA.productTitle !== null ? resolvedA : resolvedB;
        const product = await request(`/api/products/${productId}`);
        expect(product.body.status).toBe(winner.status === "PAID" ? "sold" : "available");
    });
});
