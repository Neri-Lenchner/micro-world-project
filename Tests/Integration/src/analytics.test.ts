import {beforeAll, describe, expect, it} from "vitest";
import {
    createListing,
    registerAndLogin,
    request,
    waitForAnalyticsResolvedCount,
    waitForGateway,
    waitForOrderResolved,
} from "./helpers";

beforeAll(() => waitForGateway());

describe("Analytics", () => {
    it("reflects a purchase in the summary (payment-outcome independent)", async () => {
        const before = (await request("/api/analytics/summary")).body;

        const seller = await registerAndLogin("analytics-seller");
        const buyer = await registerAndLogin("analytics-buyer");
        const productId = await createListing(seller.token);
        const created = await request("/api/orders", {method: "POST", token: buyer.token, body: {productId}});
        const resolved = await waitForOrderResolved(buyer.token, created.body.id);

        const resolvedCountBefore = before.paidCount + before.cancelledCount;
        const after = await waitForAnalyticsResolvedCount(resolvedCountBefore + 1);

        expect(after.ordersPlaced).toBe(before.ordersPlaced + 1);
        expect(after.paidCount + after.cancelledCount).toBe(resolvedCountBefore + 1);

        if (resolved.status === "PAID") {
            expect(after.totalRevenue).toBeCloseTo(before.totalRevenue + resolved.price, 2);
        }
    });

    it("is public - reachable without a token", async () => {
        const result = await request("/api/analytics/summary");
        expect(result.status).toBe(200);
    });
});
