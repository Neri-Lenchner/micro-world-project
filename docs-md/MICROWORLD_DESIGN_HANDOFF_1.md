# MicroWorld — UI Design Handoff

This file is for the Claude CLI session working in the MicroWorld repo (the one with Impeccable installed).
It explains the UI design that was made in a separate Claude (Cowork) session, so you can:

1. Use it as design context when running `/impeccable init`.
2. Build the React + TypeScript frontend to match it.
3. Run Impeccable's checks against the real code and report issues back.

**Design canvas (private, owner: Neri):** https://claude.ai/code/artifact/757141a1-c9b8-4d64-b16c-30cd509543ea
The canvas is the source of truth for layout. This file is the source of truth for tokens and behavior.
You can't open the canvas from the CLI; everything you need is written below.

---

## 1. Product in one line

MicroWorld is a two-sided marketplace (anyone can buy and sell) built as a microservices learning project.
The UI's secondary job is to make the architecture visible: order workflow steps, live updates (Socket.IO), and event streams (RabbitMQ) show up in the interface on purpose.

## 2. Visual direction

"Utilitarian editorial": warm paper background, near-black ink, one cobalt accent. Calm, dense where it needs to be, no decoration for its own sake.

Avoid: gradient washes, emoji as icons, left-border accent cards, glassmorphism, Inter/Roboto/Arial.

### Color tokens

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F6F4EF` | Page background (warm paper) |
| `--surface` | `#FFFFFF` | Cards, inputs, panels |
| `--ink` | `#1A1A17` | Primary text, dark buttons, selected chips |
| `--ink-inverse` | `#F6F4EF` | Text on ink |
| `--muted` | `#5E5A50` | Secondary text (passes 4.5:1 on `--bg`) |
| `--line` | `#DDD8CC` | Dividers, card borders |
| `--line-strong` | `#CFC9BB` | Input borders, unselected chip borders |
| `--line-soft` | `#EFEBE3` | Row dividers inside cards, chart gridlines |
| `--accent` | `#2340C8` | Primary action (one per screen), live indicators, chart bars |
| `--accent-hover` | `#1A2F99` | Link hover, hovered bar |
| `--accent-soft` | `#E4E8FA` | Info banners, "live" pills |
| `--success` | `#1F6B3A` / bg `#E2EFE5` | In stock, Delivered, Active |
| `--danger` | `#9A3412` / bg `#F6E3DD` | Cancelled, payment declined |
| `--neutral-pill` | bg `#EFEBE3`, text `#5E5A50` | Pending, Draft, Unpublished, Sold |
| Image placeholder | stripes `#ECE7DC` / `#E5DFD2` at 135° | Until real photos exist |

Status colors are reserved for status. They always appear with a text label, never color alone.

### Typography (Google Fonts)

| Role | Family | Notes |
|---|---|---|
| Display / headings | **Bricolage Grotesque** 700 | Page titles 44–56px, letter-spacing −0.03em, line-height ~1 |
| Body / UI | **Geist** 400/500/600 | 14–18px |
| Numbers, IDs, prices, event names | **Geist Mono** 400/500 | Prices, order IDs (`MW-2041`), timestamps, API/event labels |

Fallbacks: Georgia for display, `system-ui` for body, `monospace` for mono.

### Shape and spacing

- Radii: pills `999px`, cards/panels `16–20px`, inputs/small buttons `10px`, thumbnails `10–14px`.
- Page gutter 56px on desktop (1440 wide). Main layouts use a 12-column grid with a 24px gap.
- Spacing steps in use: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56.
- Touch targets are at least 44px tall. Primary buttons 52–56px, pill shaped.
- Always lay out groups with flex or grid plus `gap`, not margins.

### Icons

Inline stroke SVGs (1.8 stroke, round caps/joins, 18–20px), `currentColor`. Icon-only buttons always get an `aria-label`.

## 3. Screens (10 artboards, desktop 1440px)

Shared header on every app screen: logo "MicroWorld" · nav (Browse, Watchlist, Orders, Selling, Analytics; active = underlined + 600 weight + `aria-current="page"`) · search · notifications bell with unread badge · account · dark "Sell an item" pill.

| # | Screen | What's on it | Backed by |
|---|---|---|---|
| 1 | **Browse & search** | Big search field, "N new listings just posted" live pill, filter sidebar (category radios with counts, price min/max, condition checkboxes), sort select, 3-col listing grid (photo, condition badge, watch heart, title, price, seller · category), empty state | Search (OpenSearch), Catalog, Watchlist, Socket.IO |
| 2 | **Listing detail** | Gallery + 4 thumbs, category/condition pills, title, price, stock line ("1 available · 3 people watching"), Buy now (accent), watchlist toggle, seller card, description, details list | Catalog, Inventory, Watchlist |
| 3 | **Watchlist** | Rows: thumb, title, seller · condition, status pill (Available / Price dropped / Reserved / Sold), price with old price struck through, Buy now or "Unavailable", remove | Watchlist, Catalog |
| 4 | **Checkout + order workflow** | "Item held for 10:00" banner, shipping form, simulated payment form, order summary, Place order. After placing, a live step list animates the distributed workflow (see §4) | Order, Inventory, Payment |
| 5 | **Orders** | Purchases / Sales tabs. Latest order card with 5-step tracker (PENDING → CONFIRMED → PAID → SHIPPED → DELIVERED) and "Live updates" pill. History table with status pills; on Sales, PAID rows have "Mark shipped" | Order, Socket.IO |
| 6 | **Notifications** | Unread count, Mark all as read, filter chips (All / Orders / Watchlist / Selling), rows with type tag, title, body, time, unread dot | Notification, Socket.IO |
| 7 | **Sign in / Register** | Split layout: dark brand panel + form. Tabs switch between sign in and create account | Auth, User |
| 8 | **Seller listings** | Status filter chips with counts (All / Active / Draft / Unpublished / Sold), table: listing, price, stock ("1 in stock · 1 reserved"), views, watchers, status, Edit + Publish/Unpublish | Catalog, Inventory |
| 9 | **Create listing** | Photo upload dropzone, title, category, price, quantity, condition segmented buttons, description; right column shows a live preview card + Publish / Save as draft | Catalog, Inventory |
| 10 | **Marketplace analytics** | 7 days / 30 days toggle, 4 stat tiles (orders today, revenue today, average price, products viewed), revenue-per-day bar chart with hover readout, popular categories bars, dark "Live events" feed (event name, detail, producing service), most-viewed list | Analytics (consumes RabbitMQ events) |

All product names, prices, orders and numbers are sample data. `[LOCATION]` and `[SELLER DESCRIPTION]` are placeholders.

## 4. Key behaviors to implement

- **Order workflow (Checkout):** show each step as it happens, with the service that owns it:
  - Success: Order created (`order-service · PENDING`) → Inventory reserved → Payment approved (`pay_123`) → Order confirmed.
  - Failure: Order created → Inventory reserved → **Payment declined** (red) → Inventory released → Order cancelled, then "Try another card".
  - Each step: pending (grey ring), active (accent ring), done (ink fill + check), failed (red fill + ×). Wrap in `aria-live="polite"`.
- **Real-time (Socket.IO):** new-listing pill on Browse, order tracker on Orders, bell badge + list on Notifications. Events: `NEW_PRODUCT`, `ORDER_UPDATED`, `PAYMENT_COMPLETED`, `ORDER_SHIPPED`, `NEW_NOTIFICATION`.
- **Watchlist toggle:** heart outline → filled accent, `aria-pressed` updates, watcher count updates.
- **Inventory visibility:** show reserved units to sellers ("1 reserved") and a hold timer to buyers. This is the visible side of the "two users, one item" problem.
- **Order statuses:** exactly the spec's `PENDING | CONFIRMED | PAID | SHIPPED | DELIVERED | CANCELLED`, shown in Geist Mono inside pills.
- **Accessibility:** real `<button>`, `<a href>`, `<label>` + `<input>`, `role="tablist"` / `aria-selected` for tabs, `aria-pressed` for chips and toggles, visible focus, 4.5:1 text contrast.

## 5. Suggested React structure

```
frontend/src/
  styles/tokens.css          # the CSS variables from §2
  components/
    AppHeader.tsx  Pill.tsx  StatusPill.tsx  Chip.tsx  Tabs.tsx
    ListingCard.tsx  WatchButton.tsx  QuantityStepper.tsx
    OrderTracker.tsx  WorkflowSteps.tsx  StatTile.tsx  BarChart.tsx
    EventFeed.tsx  ImagePlaceholder.tsx
  pages/
    Browse.tsx  Listing.tsx  Watchlist.tsx  Checkout.tsx  Orders.tsx
    Notifications.tsx  Auth.tsx  SellerListings.tsx  CreateListing.tsx  Analytics.tsx
```

Charts: the spec mentions Chart.js / react-chartjs-2. If you use it, keep a single series, cobalt bars with 4px rounded tops, light gridlines, no dual axes.

## 6. What to do with Impeccable

1. Run `/impeccable init` and give it §2 of this file (direction, tokens, type, spacing, don'ts) as the project's design context.
2. When building components, run Impeccable's checks and fix what it flags.
3. If Impeccable disagrees with a token or rule here, don't silently change it. Write the finding into `DESIGN_FEEDBACK.md` (rule, screen/component, suggested fix) so the canvas can be updated to match.

## 7. Keeping design and code in sync

- Neri can bring `DESIGN_FEEDBACK.md` back to the Cowork session. The canvas gets updated there.
- Token changes go in `tokens.css` and in §2 of this file, together.
