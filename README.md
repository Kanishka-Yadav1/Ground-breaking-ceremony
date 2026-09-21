# A beautiful beginning · JSW One Homes

A browser app where a customer adds their home's **elevation image** and a
**family photo**. The family's background is removed in-browser (the photo never
leaves their device) and placed in front of the home. They can drag, resize,
flip, add a ground shadow, and download their "first glimpse", ready to frame.

Reached via the QR on the fold card, so the app is styled to match that card:
JSW One Homes logo, warm cream background, JSW Blue headlines with orange
emphasis, the circular family photo with orange + sand circle accents, rose
corner registration ticks framing the preview, the orange caption band, and the
orange footer bar.

## What changed in this version (brand pass)

- **Real JSW One Homes logo** (`public/logo.png`), extracted from the card, top-left.
- **Brand tokens** from Brand Guidelines V2.0: JSW Blue `#2241A6` text, Brand
  Orange `#FF7800`, gold `#FFBE1D`, cream `#FBF8F1`, rose ticks, sand accent.
- **Typography:** Manrope (web substitute for Neue Montreal / TT Commons) for
  text, Barlow Bold for buttons. If you license Neue Montreal, it's already
  first in the font stack and will take over automatically.
- **Card design elements:** circular hero photo (`public/hero.jpg`) with orange
  and sand circles, corner registration ticks around the framed preview, the
  "first glimpse… to frame and cherish" caption band, and the "A lifetime of
  dreams, finally taking shape." footer with the orange bar.
- Copy echoes the card's voice ("something you've always dreamed of").

## Files

```
app/layout.js     fonts + metadata
app/page.js       all app logic (upload, cutout, drag, download) + layout
app/globals.css   brand styling
public/logo.png   JSW One Homes logo (transparent)
public/hero.jpg   family-in-front-of-home photo
next.config.mjs   build config
package.json
```

---

## Updating your existing Netlify site

You already have this deployed on Netlify, so the update is just: replace the
files, commit, push. Netlify rebuilds automatically.

1. In your repo, replace the `app/` folder, add the new `public/` folder
   (with `logo.png` and `hero.jpg`), and keep `package.json` / `next.config.mjs`
   as-is. The easiest way: copy everything from this download over your repo.
2. Commit and push:
   ```bash
   git add .
   git commit -m "Brand pass: match fold card, add logo + hero"
   git push
   ```
3. Netlify picks up the push and redeploys in ~1–2 minutes. Your existing URL
   (and therefore the QR) stays the same.

> **Important:** make sure the `public/` folder with `logo.png` and `hero.jpg`
> is committed. If those are missing, the logo and hero photo won't show.

### First time on Netlify (if you ever start fresh)

1. Push this folder to a GitHub repo.
2. On Netlify: **Add new site → Import an existing project → GitHub**, pick the repo.
3. Netlify auto-detects Next.js (build command `npm run build`). Click **Deploy**.
4. You get a live `.netlify.app` URL. Set a custom domain later under
   **Site configuration → Domains** if you want.

## Run locally first

Needs Node 18.18+.

```bash
npm install
npm run dev
# open http://localhost:3000
```

The first background removal downloads the AI model (~80MB) from IMG.LY's CDN,
so it takes a few seconds the first time, then it's cached.

## Fonts (Neue Montreal / TT Commons)

The app is set in Neue Montreal with TT Commons as the fallback, per the brand
guidelines. Both are licensed fonts, so they are not bundled. Drop your licensed
`.woff2` files into `public/fonts/` (see `public/fonts/README.txt` for the exact
file names) and they load automatically via the `@font-face` rules in
`app/globals.css`. Until then, text falls back to Helvetica Neue / Arial.

## The card QR

When you're ready, point the card's QR at your live Netlify URL (replacing the
current QR). Send me the URL and I can regenerate the fold card PDF with the new
QR in place, matched to the existing artwork.

## Notes for v2

- Add a small API route that takes a project ID and returns the elevation image
  URL from your database or Salesforce; the `onElevation` handler in `page.js`
  would load that URL instead of a file input.
- Store elevation images in Netlify Blobs / S3 / a CDN, not the repo.
- If cutout edge quality (hair, fine detail) isn't clean enough on real photos,
  swap the in-browser remover for an API (Replicate BiRefNet, Photoroom,
  remove.bg) behind an API route.
- Don't bump Next.js to 16 without adjusting `next.config.mjs` (16 switched to
  Turbopack; the current webpack setting is for the pinned Next 15).
