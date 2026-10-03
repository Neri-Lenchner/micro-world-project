import {beforeAll, describe, expect, it} from "vitest";
import {buyListingUntilPaid, registerAndLogin, request, waitForGateway} from "./helpers";

beforeAll(() => waitForGateway());

describe("Shipment lifecycle", () => {
    it("only the seller can ship, only the buyer can mark delivered, each only at the right stage", async () => {
        const seller = await registerAndLogin("ship-seller");
        const buyer = await registerAndLogin("ship-buyer");
        const {orderId} = await buyListingUntilPaid(seller.token, buyer.token);

        const buyerShips = await request(`/api/orders/${orderId}/status`, {method: "PUT", token: buyer.token, body: {status: "SHIPPED"}});
        expect(buyerShips.status).toBe(403);

        const deliverTooEarly = await request(`/api/orders/${orderId}/status`, {method: "PUT", token: buyer.token, body: {status: "DELIVERED"}});
        expect(deliverTooEarly.status).toBe(400);

        const shipped = await request(`/api/orders/${orderId}/status`, {method: "PUT", token: seller.token, body: {status: "SHIPPED"}});
        expect(shipped.status).toBe(200);
        expect(shipped.body.status).toBe("SHIPPED");

        const shipAgain = await request(`/api/orders/${orderId}/status`, {method: "PUT", token: seller.token, body: {status: "SHIPPED"}});
        expect(shipAgain.status).toBe(400);

        const sellerDelivers = await request(`/api/orders/${orderId}/status`, {method: "PUT", token: seller.token, body: {status: "DELIVERED"}});
        expect(sellerDelivers.status).toBe(403);

        const delivered = await request(`/api/orders/${orderId}/status`, {method: "PUT", token: buyer.token, body: {status: "DELIVERED"}});
        expect(delivered.status).toBe(200);
        expect(delivered.body.status).toBe("DELIVERED");
    });
});
