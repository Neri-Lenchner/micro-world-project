// Hits the real stack over HTTP, through the Gateway - the exact same path a browser uses.
// Assumes `docker compose up` (or an equivalent running stack) is already reachable here.
export const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:8081";

interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    token?: string;
    body?: unknown;
}

export async function request(path: string, options: RequestOptions = {}): Promise<{ status: number; body: any }> {
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.token) headers["Authorization"] = `Bearer ${options.token}`;

    const response = await fetch(`${GATEWAY_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let body: any = undefined;
    if (text) {
        try {
            body = JSON.parse(text);
        } catch {
            body = text;
        }
    }
    return {status: response.status, body};
}

// Waits for the Gateway to actually accept connections - useful right after `docker compose up`,
// where containers report "started" well before they're actually ready to serve traffic.
export async function waitForGateway(timeoutMs = 60_000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const res = await fetch(`${GATEWAY_URL}/api/products`);
            if (res.ok) return;
        } catch {
            // not up yet
        }
        await sleep(1000);
    }
    throw new Error(`Gateway at ${GATEWAY_URL} did not become reachable within ${timeoutMs}ms`);
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Each test run gets its own emails, so it's safe to re-run locally against a stack
// that still has data from a previous run (not just a fresh CI volume every time).
let counter = 0;

export function uniqueEmail(label: string): string {
    counter += 1;
    return `test-${label}-${Date.now()}-${counter}@microworld.test`;
}

export async function registerAndLogin(label: string, password = "TestPass123!"): Promise<{ email: string; token: string }> {
    const email = uniqueEmail(label);
    const registerResult = await request("/api/auth/register/", {method: "POST", body: {email, password}});
    if (registerResult.status >= 400) throw new Error(`Register failed for ${email}: ${JSON.stringify(registerResult.body)}`);

    const loginResult = await request("/api/auth/login/", {method: "POST", body: {email, password}});
    if (loginResult.status >= 400) throw new Error(`Login failed for ${email}: ${JSON.stringify(loginResult.body)}`);

    return {email, token: loginResult.body.token};
}

export async function createListing(sellerToken: string, overrides: Partial<Record<string, string>> = {}): Promise<number> {
    const form = new FormData();
    form.set("title", overrides.title ?? `Test Item ${Date.now()}-${Math.random()}`);
    form.set("description", overrides.description ?? "created by the integration test suite");
    form.set("price", overrides.price ?? "25");
    form.set("category", overrides.category ?? "other");
    form.set("condition", overrides.condition ?? "used");

    const response = await fetch(`${GATEWAY_URL}/api/products`, {
        method: "POST",
        headers: {Authorization: `Bearer ${sellerToken}`},
        body: form,
    });
    const body = await response.json();
    if (response.status >= 400) throw new Error(`Create listing failed: ${JSON.stringify(body)}`);
    return body.id;
}

// Polls an order until it leaves PENDING (the saga resolves within a second or two in
// practice) or the timeout elapses, whichever comes first.
export async function waitForOrderResolved(token: string, orderId: number, timeoutMs = 10_000): Promise<any> {
    const deadline = Date.now() + timeoutMs;
    let last: any;
    while (Date.now() < deadline) {
        const result = await request(`/api/orders/${orderId}`, {token});
        last = result.body;
        if (last.status !== "PENDING") return last;
        await sleep(300);
    }
    throw new Error(`Order ${orderId} did not resolve out of PENDING within ${timeoutMs}ms (last seen: ${JSON.stringify(last)})`);
}

// Payment approves ~85% of the time by design (see Backend/Payment) - tests that need a
// PAID order as a precondition (e.g. shipment) retry with a fresh listing on a decline,
// rather than asserting a single purchase always succeeds. ~10 attempts makes a false
// failure here astronomically unlikely (0.15^10) without ever being a real flake.
export async function buyListingUntilPaid(
    sellerToken: string, buyerToken: string, maxAttempts = 10
): Promise<{ productId: number; orderId: number }> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const productId = await createListing(sellerToken);
        const created = await request("/api/orders", {method: "POST", token: buyerToken, body: {productId}});
        const resolved = await waitForOrderResolved(buyerToken, created.body.id);
        if (resolved.status === "PAID") return {productId, orderId: created.body.id};
    }
    throw new Error(`Payment declined ${maxAttempts} times in a row - something is actually wrong`);
}
