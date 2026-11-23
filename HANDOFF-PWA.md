# FitCoach AI — PWA Handoff: How it runs as an installed app on an Android tablet

**Status:** ✅ Working. FitCoach AI is a Progressive Web App (PWA), deployed and **installed on an Android tablet** (Brave browser), running fullscreen from the home screen. This document explains exactly how, with verifiable facts.

**If another conversation says "a PWA is not possible on your tablet," that is incorrect for installability.** The likely confusion is explained in the "Where the 'not possible' claim comes from" section below — it conflates *installing a PWA* (done, working) with *push notifications while the app is closed* (a separate, harder feature that Brave limits). Those are two different things.

---

## 1. The facts (verifiable)

| Item | Value |
|---|---|
| Live app URL | `https://gilberthcl.github.io/FitCoach/` |
| Source repo | `https://github.com/gilberthcl/FitCoach` (public) |
| Hosting | GitHub Pages (free), deploy from `main` branch, `/` root |
| Transport | HTTPS (required for PWAs; GitHub Pages provides it, "Enforce HTTPS" on) |
| Current version | **1.1.0** |
| Tablet | Android, **Brave** browser, installed via ⋮ → **Install app** |
| Search visibility | Hidden (`robots.txt` + `<meta name="robots" content="noindex">`) |

Files served (the entire app is static — no backend, no database, no server code):

```
index.html        # the whole app (HTML + CSS + JS in one file)
manifest.json     # PWA metadata — makes it installable
sw.js             # service worker — enables offline + install + notifications
icon-192.png      # home-screen icon
icon-512.png      # splash / high-res icon
robots.txt        # keep out of search engines
.gitignore        # prevents junk/backup files from being committed
```

---

## 2. What makes a web page an *installable* PWA

Three technical requirements — **all three are met here**:

1. **Served over HTTPS** → GitHub Pages serves `https://gilberthcl.github.io/FitCoach/`. ✅
2. **A Web App Manifest** (`manifest.json`) linked from the HTML, with a name, icons (192px + 512px), `start_url`, and `display: standalone`. ✅
3. **A registered Service Worker** (`sw.js`) → gives offline capability and is required for the browser to offer "Install." ✅

When those three exist, Chromium-based browsers (including Brave on Android) show an **"Install app" / "Add to Home Screen"** option. That's exactly what was used.

### The actual manifest (`manifest.json`)
```json
{
  "name": "FitCoach AI",
  "short_name": "FitCoach",
  "description": "Tu entrenador personal con IA — workouts personalizados",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#0d0f1a",
  "theme_color": "#0d0f1a",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```
- `display: standalone` is what makes it open **fullscreen like a native app** (no browser address bar).
- The HTML links it with `<link rel="manifest" href="manifest.json">`.

### The service worker (`sw.js`) — what it does
- **Caches the app shell** (`index.html`, `manifest.json`) so the app **works offline** after first load.
- Always fetches **live** for the Claude API and exercise GIFs (never cached).
- Carries a **cache version** (`const CACHE = 'fitcoach-1.1.0'`) that changes on every release — this is the update mechanism (see §6).
- Handles **notification clicks** (added in 1.1.0) to focus/open the app.
- Registered from the HTML with `navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })`.

---

## 3. How it was deployed (step by step)

1. The 5 app files were put in a public GitHub repo: `gilberthcl/FitCoach`.
2. The main HTML was named `index.html` (so the URL is a clean `/FitCoach/`).
3. `manifest.json` `start_url` was set to `./index.html`.
4. **GitHub Pages** was enabled: Settings → Pages → **Deploy from a branch** → `main` → `/ (root)` → Save.
5. GitHub Pages built and published at `https://gilberthcl.github.io/FitCoach/` (HTTPS, free).
6. Updates ship by committing new `index.html` / `sw.js` to `main`; Pages redeploys in ~1 minute.

**Why public:** free GitHub Pages requires a public repo. There are **no secrets in the code** — the Claude API key is entered by the user on the device and stored only in the browser's `localStorage`; it is never in the repo. `noindex` + `robots.txt` keep the site out of search results.

---

## 4. How it was installed on the Android tablet

1. Open **`https://gilberthcl.github.io/FitCoach/`** in **Brave** on the tablet.
2. Brave menu **⋮** → **Install app** (or "Add to Home Screen").
3. Confirm → **FitCoach AI** icon appears on the home screen.
4. Launch from the home screen → opens **fullscreen, standalone**, works offline.

This is a real, installed PWA — not a bookmark. Android treats installed PWAs as app-like entries.

---

## 5. Where the "not possible" claim comes from (important)

A PWA has two separate layers, and they get conflated:

| Capability | Status on this tablet | Notes |
|---|---|---|
| **Install as a fullscreen app** | ✅ Works | Done — the app is installed and running. |
| **Work offline** | ✅ Works | Service worker caches the shell. |
| **In-app / on-launch reminders** | ✅ Works | No server needed. |
| **Push notifications when the app is fully CLOSED** | ⚠️ Limited | This is the hard part — and it's where "not possible" likely comes from. |

**The nuance:** True "notify me at 6 PM even when the app is closed" needs either a push backend or background-sync, and **Brave specifically strips/limits background push** for privacy. On **iPad**, web push also only works on iPadOS 16.4+ for installed PWAs. So a session focused on *that feature* (or assuming an iPad) could reasonably say "reliable background notifications aren't possible here" — but that is **not** the same as "a PWA isn't possible." The PWA is installed and working; only the closed-app push layer is constrained.

If the other conversation lacked the repo/context, it may also have simply assumed no hosting existed. The hosting exists and is live (§1).

---

## 6. Update mechanism (so future changes reach the tablet)

- Every release bumps **both** `APP_VERSION` (shown in Profile → "Versión instalada") **and** the service-worker cache key `fitcoach-<version>`. Changing the cache key is what makes the installed app detect and pull the new version.
- The app checks for updates on launch and via **Profile → Buscar actualizaciones**; on a new version it installs and reloads.
- Versioning is **semantic**: fixes = patch (`1.0.1`), features = minor (`1.1.0`), big reworks = major (`2.0.0`).

---

## 7. Current feature state (v1.1.0)

- **Onboarding wizard** builds the user profile (no hardcoded data).
- **AI workouts** via the Claude API (key entered on-device, stored in `localStorage`).
- **Offline** app shell; all data stored locally (private; nothing synced to GitHub).
- **No emojis** anywhere (replaced with inline SVG icons); exercise GIFs from open repos.
- **Calendar** tab maps workout sessions over time.
- **Notifications foundation**: Profile → Notificaciones (opt-in, per-category toggles, "send test"). *Closed-app scheduled reminders are the next step, pending a Brave deliverability test.*

---

## 8. How to independently verify

1. Open `https://gilberthcl.github.io/FitCoach/` in any browser → the app loads over HTTPS.
2. View source → `<link rel="manifest" href="manifest.json">` and a `serviceWorker.register('sw.js', ...)` call are present.
3. Open `https://gilberthcl.github.io/FitCoach/manifest.json` → valid manifest with icons.
4. In Chrome/Brave DevTools → Application tab → Manifest + Service Workers both show as installed/active → the browser confirms it as installable.
5. Repo is public at `https://github.com/gilberthcl/FitCoach` — the 5 app files are there.

---

**Bottom line:** This is a fully functional, installed PWA on an Android tablet, hosted free on GitHub Pages over HTTPS, with a valid manifest and service worker. Installing a PWA on this tablet is not only possible — it's already done and in use. The only genuinely constrained piece is background push notifications in Brave, which is a separate feature, not a blocker to the PWA itself.
