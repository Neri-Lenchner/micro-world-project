import {beforeAll, describe, expect, it} from "vitest";
import {registerAndLogin, request, uniqueEmail, waitForGateway} from "./helpers";

beforeAll(() => waitForGateway());

describe("Auth", () => {
    it("registers and logs in", async () => {
        const {email, token} = await registerAndLogin("auth-basic");
        expect(email).toContain("@microworld.test");
        expect(typeof token).toBe("string");
        expect(token.length).toBeGreaterThan(10);
    });

    it("rejects a duplicate registration", async () => {
        const email = uniqueEmail("auth-dup");
        const password = "TestPass123!";
        const first = await request("/api/auth/register/", {method: "POST", body: {email, password}});
        expect(first.status).toBeLessThan(300);

        const second = await request("/api/auth/register/", {method: "POST", body: {email, password}});
        expect(second.status).toBeGreaterThanOrEqual(400);
    });

    it("rejects a wrong password", async () => {
        const email = uniqueEmail("auth-wrong-pw");
        await request("/api/auth/register/", {method: "POST", body: {email, password: "TestPass123!"}});

        const result = await request("/api/auth/login/", {method: "POST", body: {email, password: "NotTheRightPassword"}});
        expect(result.status).toBe(401);
    });

    it("rejects an unauthenticated request to a protected route", async () => {
        const result = await request("/api/orders");
        expect(result.status).toBe(401);
    });
});
