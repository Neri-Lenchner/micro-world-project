---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/pages","src/components"]
---

## Direction contract

THESIS: Make the marketplace's distributed backend legible without sacrificing usability — refuses the category default of a bright, gradient-heavy SaaS marketplace that hides its mechanics behind glossy cards and vague "processing…" states.

OWN-WORLD: Warm paper background `#F6F4EF`, near-black ink `#1A1A17`, one cobalt accent `#2340C8` used once per screen for the primary action. Bricolage Grotesque 700 for display (44–56px, −0.03em tracking, line-height ~1), Geist 400/500/600 for body/UI (14–18px), Geist Mono 400/500 for prices, order IDs, timestamps, and event/service names. Pill radii (999px) on buttons and status chips, 16–20px on cards/panels, 10px on inputs and small buttons. Striped placeholder imagery (`#ECE7DC`/`#E5DFD2` at 135°) until real photos exist. Inline stroke SVG icons only (1.8 stroke, round caps/joins, 18–20px, `currentColor`), never emoji.

STORY: A visitor browsing understands this is a real, working two-sided marketplace — search, filter, buy, sell, watch — and, distinctly, watches the underlying distributed system work in real time: an order's steps light up one by one, each labeled with the service that owns it (`order-service · PENDING`), a live pill announces new listings, notifications arrive via socket. They come away believing the product is both genuinely usable and architecturally honest, never a mockup.

FIRST VIEWPORT: Browse screen. Shared header (logo, nav with underline+600-weight active state, search field, notification bell with unread badge, account, dark "Sell an item" pill) above a live "N new listings just posted" pill. Below: a filter sidebar (category radios with counts, price min/max, condition checkboxes) beside a 3-column listing grid — photo/placeholder, condition badge, watch heart toggle, title, price set in Geist Mono, "seller · category" in muted ink. The one cobalt accent on this screen is the live pill and the watch-heart-filled state; the primary "Sell" action is rendered in ink, per the one-accent-per-screen rule.

FORM: User-pinned direction ("utilitarian editorial") authored in a separate design session and handed off verbatim in `docs-md/MICROWORLD_DESIGN_HANDOFF_1.md`, confirmed as a binding Brand Commitment in PRODUCT.md — not selected via `concept-seed`. Per SKILL.md's "the brief wins" rule, the direction-invention/roll step is skipped by contract here, not by drift: the world was already decided by the user before this session began.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
