import {beforeAll, describe, expect, it} from "vitest";
import {createListing, registerAndLogin, request, waitForGateway} from "./helpers";

beforeAll(() => waitForGateway());

describe("Watchlist", () => {
    it("is idempotent to save, and removable", async () => {
        const seller = await registerAndLogin("watch-seller");
        const watcher = await registerAndLogin("watch-watcher");
        const productId = await createListing(seller.token);

        const firstSave = await request(`/api/watchlist/${productId}`, {method: "POST", token: watcher.token});
        expect(firstSave.status).toBe(204);
        const secondSave = await request(`/api/watchlist/${productId}`, {method: "POST", token: watcher.token});
        expect(secondSave.status).toBe(204);

        const list = await request("/api/watchlist", {token: watcher.token});
        const matches = list.body.filter((item: any) => item.productId === productId);
        expect(matches.length).toBe(1);

        const removed = await request(`/api/watchlist/${productId}`, {method: "DELETE", token: watcher.token});
        expect(removed.status).toBe(204);

        const listAfter = await request("/api/watchlist", {token: watcher.token});
        expect(listAfter.body.some((item: any) => item.productId === productId)).toBe(false);
    });
});
