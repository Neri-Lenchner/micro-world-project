import {beforeAll, describe, expect, it} from "vitest";
import {buyListingUntilPaid, registerAndLogin, request, waitForGateway} from "./helpers";

beforeAll(() => waitForGateway());

describe("Notifications", () => {
    it("notifies the buyer and the seller when an order is paid", async () => {
        const seller = await registerAndLogin("notif-seller");
        const buyer = await registerAndLogin("notif-buyer");
        await buyListingUntilPaid(seller.token, buyer.token);

        const buyerNotifications = await request("/api/notifications", {token: buyer.token});
        expect(buyerNotifications.body.some((n: any) => n.type === "ORDER_PAID")).toBe(true);

        const sellerNotifications = await request("/api/notifications", {token: seller.token});
        expect(sellerNotifications.body.some((n: any) => n.type === "ORDER_SOLD")).toBe(true);
    });

    it("marking one notification read doesn't affect the others", async () => {
        const seller = await registerAndLogin("notif-read-seller");
        const buyer = await registerAndLogin("notif-read-buyer");
        await buyListingUntilPaid(seller.token, buyer.token);
        await buyListingUntilPaid(seller.token, buyer.token);

        const before = await request("/api/notifications", {token: buyer.token});
        expect(before.body.length).toBeGreaterThanOrEqual(2);
        const [first, second] = before.body;

        await request(`/api/notifications/${first.id}/read`, {method: "PUT", token: buyer.token});

        const after = await request("/api/notifications", {token: buyer.token});
        expect(after.body.find((n: any) => n.id === first.id).read).toBe(true);
        expect(after.body.find((n: any) => n.id === second.id).read).toBe(false);
    });
});
