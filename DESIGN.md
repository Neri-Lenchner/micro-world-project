---
name: MicroWorld
description: A utilitarian-editorial marketplace that makes its own distributed architecture visible.
colors:
  warm-paper: "#F6F4EF"
  paper-white: "#FFFFFF"
  warm-ink: "#1A1A17"
  ink-inverse: "#F6F4EF"
  warm-graphite: "#5E5A50"
  hairline: "#DDD8CC"
  hairline-strong: "#CFC9BB"
  hairline-soft: "#EFEBE3"
  cobalt: "#2340C8"
  cobalt-deep: "#1A2F99"
  cobalt-mist: "#E4E8FA"
  forest: "#1F6B3A"
  mint-wash: "#E2EFE5"
  clay: "#9A3412"
  clay-wash: "#F6E3DD"
  paper-tint-bg: "#EFEBE3"
  paper-tint-text: "#5E5A50"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.04em"
  mono:
    fontFamily: "Geist Mono, monospace"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  pill: "999px"
  card: "18px"
  input: "10px"
  thumb: "12px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  7: "28px"
  8: "32px"
  10: "40px"
  12: "48px"
  14: "56px"
components:
  button-primary:
    backgroundColor: "{colors.warm-ink}"
    textColor: "{colors.ink-inverse}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "#000000"
  button-secondary:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-accent:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.ink-inverse}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-accent-hover:
    backgroundColor: "{colors.cobalt-deep}"
  button-danger:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.clay}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  card-product:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.card}"
    padding: "16px 20px 20px"
  pill-status-neutral:
    backgroundColor: "{colors.paper-tint-bg}"
    textColor: "{colors.paper-tint-text}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  input-field:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.input}"
    padding: "12px 16px"
---

# Design System: MicroWorld

## Overview

**Creative North Star: "The Working Ledger"**

MicroWorld reads like a well-kept ledger for a marketplace that isn't shy about its own machinery: warm paper, near-black ink, and exactly one cobalt accent per screen, set in a display face with real editorial weight and a monospace register reserved for the numbers that matter — prices, order IDs, timestamps, the names of the services doing the work. The system is calm and dense where density earns its keep (a browse grid, a listings table), and generous where a decision is being made (checkout, a form). Nothing is decorative; every mark on the page is either content, a control, or evidence of the distributed system underneath. Rejected explicitly: gradient washes, emoji standing in for icons, colored left-border accent cards, glassmorphism, and default system sans (Inter/Roboto/Arial) as a display face.

**Key Characteristics:**
- Warm, flat, paper-and-ink surface language — no drop shadows, hairline borders instead
- One saturated accent (cobalt) per screen, reserved for the single primary or live moment
- Bricolage Grotesque display type carries the editorial voice; Geist Mono marks anything measurable
- Pill radii on every actionable control; softer card radii on containers
- Condition/category/status are always a labeled pill, never color alone

## Colors

Warm and restrained: paper and ink carry the page, cobalt is spent once per screen, and status colors are reserved strictly for status pills.

### Primary
- **Cobalt** (`#2340C8`): the one primary/live action per screen — the accent "Buy now" button, a future live-listings pill, a filled watch state. Never used for routine navigation or secondary buttons.

### Neutral
- **Warm Paper** (`#F6F4EF`): page background.
- **Paper White** (`#FFFFFF`): cards, inputs, panels, surfaces that sit above the page.
- **Warm Ink** (`#1A1A17`): primary text, and the fill for the default (non-accent) primary button and the dark header/brand panel.
- **Ink Inverse** (`#F6F4EF`): text set on ink or cobalt fills.
- **Warm Graphite** (`#5E5A50`): secondary/muted text; holds ≥4.5:1 on warm paper.
- **Hairline** (`#DDD8CC`): card and panel borders, section dividers.
- **Hairline Strong** (`#CFC9BB`): input borders, unselected chip/pill borders.
- **Hairline Soft** (`#EFEBE3`): row dividers inside cards, dropzone fill.

### Named Rules
**The One Accent Rule.** Cobalt appears at most once per screen, reserved for that screen's single primary or live moment (the disabled "Buy now" CTA today; a live-updates pill or filled watch heart once those services exist). A default submit button, a nav link, or a secondary action is never cobalt — it's ink or paper-white-with-border.

**The Labeled Status Rule.** Condition, category, and any future order/listing status is always rendered as a pill with a text label. Color never carries status alone.

## Typography

**Display Font:** Bricolage Grotesque 700 (with Georgia, serif fallback)
**Body Font:** Geist 400/500/600 (with system-ui, sans-serif fallback)
**Label/Mono Font:** Geist Mono 400/500 (with monospace fallback)

**Character:** A confident grotesque display paired with a quiet, workmanlike body face; the mono face is the tell that a number is real data (a price, an ID, a timestamp) rather than prose.

### Hierarchy
- **Display** (700, `clamp(32px, 4vw, 48px)`, line-height 1.05, tracking −0.03em): page titles ("Browse", "Sell an item", the home hero headline).
- **Headline** (700, `clamp(24px, 3vw, 32px)`, tracking −0.03em): section headings ("Latest listings").
- **Title** (600, 16–18px): card titles, form section legends.
- **Body** (400, 16px, line-height 1.5): paragraph copy, descriptions, form labels' companion text.
- **Label** (600, 13px, tracking 0.04em, uppercase): filter-group legends, the "Preview" caption on the sell form.
- **Mono** (400–500, 13–28px): prices, order/listing identifiers, timestamps, service/event names.

### Named Rules
**The Mono-Means-Real Rule.** Only measurable, machine-real values are set in Geist Mono: prices, IDs, dates, event/service names. Never used decoratively for "technical" flavor on prose.

## Layout

12-column intent expressed pragmatically as CSS Grid per surface rather than a fixed grid system: the Browse screen is a named-area grid (title / search / sidebar / results, 240px sidebar + fluid results column), the auth screen is a fixed two-column split (brand panel + form, collapsing to one column under 720px), and the sell/edit form is fields-plus-sticky-preview (collapsing under 760px). Page gutter is 56px on desktop inside a 1440px max-width shell, dropping to 16px under 720px. Spacing steps in use: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56px — tight within a control, generous between sections. Responsive collapse is single-breakpoint per surface (720–860px), stacking sidebars/columns to one column rather than reflowing to an intermediate layout.

## Elevation & Depth

Flat by design — no drop shadows anywhere in the system. Depth and separation are conveyed entirely through hairline borders (`1px solid` hairline tokens) and flat color contrast between warm-paper and paper-white surfaces, consistent with the "no decoration for its own sake" brief.

### Named Rules
**The Flat-By-Default Rule.** Surfaces separate by a 1px hairline border and a background-color step (paper vs. warm-paper), never by `box-shadow`. A shadow appearing anywhere in this system is a bug, not a variant.

## Shapes

Two radius families, no exceptions: **pill** (`999px`) on every actionable control — buttons, chips, status pills, condition badges — and a **card radius** (`18px`) on containers — product cards, panels, the auth split-layout shell. Inputs and small buttons use a tighter `10px`; thumbnails use `12px`. Borders are always `1px`, in a hairline token, never heavier.

## Components

### Buttons
- **Shape:** pill (`border-radius: 999px`), minimum 44px tall, 52–56px for primary CTAs.
- **Primary (default):** warm-ink fill, ink-inverse text — the ordinary primary action (Publish, Sign in, Search).
- **Accent:** cobalt fill, ink-inverse text — reserved for the screen's one live/primary moment (Buy now). Stays fully saturated even when `disabled`; opacity dimming is never applied to the accent variant, since a washed cobalt defeats its purpose.
- **Secondary:** paper-white fill, warm-ink text, hairline-strong border.
- **Danger:** paper-white fill, clay text and border; fills clay-wash on hover.
- **Hover:** primary darkens toward pure black; accent darkens to cobalt-deep; secondary/danger fill with their soft wash tint.
- **Disabled:** 50% opacity for primary/secondary/danger; accent is the sole exception (see above).

### Chips / Segmented controls
- **Style:** pill, hairline-strong border, 14px/500 text.
- **Selected state:** ink fill, ink-inverse text — used for single-select condition filters and the ProductForm condition segmented control.

### Cards / Containers
- **Corner Style:** 18px (product cards, panels), 12px (thumbnails).
- **Background:** paper-white on warm-paper page background.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Border:** 1px hairline.
- **Internal Padding:** 16px sides / 20px bottom on product cards; 32px on form panels.

### Inputs / Fields
- **Style:** 1px hairline-strong border, 10px radius, paper-white background, 44px min height.
- **Focus:** 2px cobalt outline, 2px offset (shared with buttons/links — the one accessibility-mandated use of cobalt that sits outside the One Accent Rule).
- **Placeholder text:** warm-graphite.

### Navigation
- Logo in Bricolage Grotesque 700; nav links in Geist 500, warm-graphite at rest, warm-ink + 2px ink underline when active (`aria-current="page"` via NavLink). The "Sell an item" pill is always the ink-filled primary button, rightmost in the header. Below 720px the link row wraps beneath the brand/account row.

### Auth Split Panel (signature component)
Two-column shell: a dark (warm-ink) brand panel with the wordmark and a one-line positioning statement, beside a paper-white panel holding route-based tabs ("Sign in" / "Create account", underline-active styled identically to primary nav) and the form itself. Collapses to a stacked single column under 720px, brand panel first.

## Do's and Don'ts

### Do:
- **Do** spend cobalt on exactly one element per screen — the screen's single primary or live action.
- **Do** render condition/category/status as a labeled pill (paper-tint neutral by default), never as a bare color swatch.
- **Do** set prices, IDs, timestamps, and service/event names in Geist Mono.
- **Do** separate surfaces with a 1px hairline border and a background step, never a shadow.
- **Do** keep every actionable control pill-shaped and at least 44px tall.

### Don't:
- **Don't** use gradient text, glassmorphism, or a colored `border-left` accent on any card or list row.
- **Don't** dim the accent button variant on `:disabled` — keep it fully saturated; the disabled state reads through cursor and copy instead.
- **Don't** introduce a second saturated accent color on a screen that already has one.
- **Don't** fabricate data the backing services don't yet provide (stock counts, watcher counts, live-listing pills, notification badges) — omit the affordance until the service exists, rather than faking it.
- **Don't** use Inter, Roboto, or system-ui as a display face; Bricolage Grotesque is the display voice everywhere.
