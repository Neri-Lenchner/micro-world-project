# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: portfolio/demo viewers (recruiters, technical reviewers, the developer). The buyer and seller personas that appear in the UI (browsing, listing, watching, ordering) are simulated roles used to demonstrate the product and its architecture — not a live user base. Content, flows, and copy should read as a genuinely usable two-sided marketplace, but the design brief optimizes for a reviewer evaluating craft and system-design understanding, not for acquiring real buyers/sellers.

## Product Purpose

MicroWorld is a full-stack, event-driven marketplace built primarily as a practical microservices and system-design learning/portfolio project. Functionally it supports registration, browsing/search, listing management, watchlists, orders, notifications, and marketplace analytics. Success means both (a) a coherent, usable marketplace UI and (b) the underlying distributed-systems behavior (real-time updates, event-driven workflows, inventory concurrency) being visible and understandable through the UI.

## Positioning

The UI's secondary job — beyond being a usable marketplace — is to make the microservices architecture legible: the order workflow renders each distributed step as it happens (which service owns it), live updates arrive via Socket.IO, and analytics surfaces RabbitMQ event streams. A generic marketplace clone could not truthfully claim this: the interface is built to expose its own backend's event-driven mechanics, not just to move product listings.

## Operating Context

- Generic marketplace domain (any category of used goods) is the committed direction; a previously floated "GuitarFinder" (guitars/music gear only) reskin is explicitly shelved, not on the roadmap.
- Backend is a microservices architecture: Gateway, Auth, User, Catalog, Watchlist, Order, Inventory, Payment, Notification, Search, Analytics — built incrementally. Current implemented surface (as of this writing) covers Gateway, Auth, Catalog (with product CRUD, image upload, seed data), and a React/TS frontend with Browse, Product Details, My Listings, Sell, Edit Listing, Login, and Register. Watchlist, Checkout/Orders, Notifications, and Analytics screens are specified but not yet built.
- All product data (listings, prices, orders, seller names) is sample/seed data — never real commerce, real payment processing, or real user PII beyond auth credentials.
- Order statuses are the fixed spec set: `PENDING | CONFIRMED | PAID | SHIPPED | DELIVERED | CANCELLED`.
- Real-time events the UI must reflect: `NEW_PRODUCT`, `ORDER_UPDATED`, `PAYMENT_COMPLETED`, `ORDER_SHIPPED`, `NEW_NOTIFICATION`.

## Capabilities and Constraints

- Payment is simulated (no real money movement) but must model a real distributed payment workflow, including the failure path (payment declined → inventory released → order cancelled).
- Inventory reservation must visibly demonstrate the "two buyers, one item" concurrency problem: sellers see reserved-unit counts, buyers see a hold timer.
- Search is a separately maintained index (OpenSearch), eventually consistent with the Catalog database — UI copy/behavior should not imply instant consistency.
- Terminology: "listing" and "product" are used interchangeably for a Catalog item; "order" always refers to a single-item purchase flow per the current data model.

## Brand Commitments

- Name: MicroWorld.
- A detailed visual system (tokens, type, spacing, iconography, screen-by-screen content) has been produced separately and is recorded in `docs-md/MICROWORLD_DESIGN_HANDOFF_1.md`; treat it as binding creative direction to carry into DESIGN.md rather than re-deriving from scratch.

## Evidence on Hand

- Full architecture/domain spec: `docs-md/MicroWorld.md` and `docs-md/MicroWorld-2.md` (two overlapping drafts, both kept as-is).
- Visual direction handoff (tokens, typography, spacing, screen inventory, key behaviors, suggested component structure): `docs-md/MICROWORLD_DESIGN_HANDOFF_1.md`.
- No real product photography, testimonials, pricing history, or user data exist or should be fabricated; all imagery is placeholder (striped placeholder pattern) until real photos exist.

## Product Principles

1. Build incrementally, one architectural problem at a time — do not add complexity without a concrete reason.
2. Every distributed-systems concern (concurrency, idempotency, eventual consistency, failure handling) that exists in the backend should have a visible, honest reflection in the UI rather than being hidden behind a falsely-simple interface.
3. The marketplace must stand on its own as a usable, coherent product — architecture-legibility is additive, never an excuse for confusing UX.
4. Data, sellers, and transactions are simulated; never present them as real commerce or fabricate evidence (reviews, benchmarks, real user counts) that doesn't exist.

## Accessibility & Inclusion

Real semantic elements required (`<button>`, `<a href>`, `<label>`+`<input>`, `role="tablist"`/`aria-selected` for tabs, `aria-pressed` for chips/toggles). Status must never be conveyed by color alone — always paired with a text label. Minimum 4.5:1 text contrast. Visible focus states. Icon-only controls require `aria-label`. Live-updating regions (e.g., order workflow steps) use `aria-live="polite"`.
