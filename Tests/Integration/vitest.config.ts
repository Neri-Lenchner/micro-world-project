import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The full saga (reserve → pay → confirm, or ship/deliver) round-trips through
    // RabbitMQ a few times per test - slower than a typical unit test's default 5s.
    testTimeout: 15_000,
    hookTimeout: 20_000,
    // These tests share one live backend, not an isolated instance each - most tests use
    // unique emails/listings so they don't interfere, but Analytics is deliberately
    // marketplace-wide/global, so a before/after snapshot in one file would see writes
    // from any other file running at the same time. Serial files keep that deterministic.
    fileParallelism: false,
  },
});
