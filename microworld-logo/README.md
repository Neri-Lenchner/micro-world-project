# MicroWorld — logo & favicon

Three options, one folder each. Pick one and copy its files into `frontend/public/`.

| Folder | Idea |
|---|---|
| `option-a-hub/` | Gateway node with six services around it |
| `option-b-two-piece-m/` | An "m" built from two separate pieces, on a cobalt tile (strongest favicon) |
| `option-c-quartered-world/` | A globe split into four independent quarters |

## Files in each folder

| File | Use |
|---|---|
| `logo.svg` / `logo.png` | Mark + "MicroWorld" wordmark, for light backgrounds (header, README) |
| `logo-on-dark.svg` / `.png` | Same, for dark backgrounds |
| `mark.svg` / `mark-on-dark.svg` | Symbol only |
| `favicon.svg` | Modern browsers (options A and C switch colors in dark mode automatically) |
| `favicon.ico` | Legacy fallback (16, 32, 48 px inside) |
| `favicon-16.png`, `favicon-32.png`, `favicon-48.png` | PNG fallbacks |
| `apple-touch-icon.png` | iOS home screen (180 px) |
| `icon-192.png`, `icon-512.png` | PWA / Android (`manifest.json`) |

The wordmark is outlined (converted to paths), so the SVGs look right without the font installed.
Font: Bricolage Grotesque 700. Colors: ink `#1A1A17`, paper `#F6F4EF`, cobalt `#2340C8` (dark-mode cobalt `#7FA0FF`).

## HTML (`frontend/index.html` `<head>`)

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
```

## `manifest.json` icons

```json
"icons": [
  { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
]
```

## React header

```tsx
<a href="/" aria-label="MicroWorld home">
  <img src="/logo.svg" alt="MicroWorld" height={28} />
</a>
```
