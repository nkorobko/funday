# FunDay 🎉

A fun-day planning platform for Employee Experience managers at Conifers: pick an activity type, city/area, budget, and group size — get matching activities from a curated provider catalog with the cost math done for you, then send a booking request to the provider in one click (WhatsApp or email).

**Live app**: https://nkorobko.github.io/funday/
**Catalog admin**: https://nkorobko.github.io/funday/admin.html

- **Fully static** — GitHub Pages, no backend, no secrets, $0/month.
- **Two markets**: 🇮🇱 Israel (Hebrew, RTL, ₪) and 🇺🇸 Dallas (English, LTR, $) — switch in the header.
- **The repo is the database** — the catalog lives in [`data/activities.json`](data/activities.json); git history is the audit log.
- Branding per the Conifers Simplified Brand Guide (Jan 2025).

## Updating the catalog

1. Open the [admin page](https://nkorobko.github.io/funday/admin.html), fill in the new activity, click **Add activity** (client-side validation runs the same rules as CI).
2. Click **Download updated activities.json**.
3. Replace `data/activities.json` with the downloaded file and commit (or use GitHub's web editor).
4. CI validates the catalog on every push; the app deploys automatically via GitHub Pages.

## Development

No build step — plain HTML/CSS/ES modules.

```bash
python3 -m http.server 8642   # serve locally, open http://127.0.0.1:8642/
npm test                      # unit tests (node --test) for js/logic.js
npm run validate              # validate data/activities.json
```

| Path | Responsibility |
|------|----------------|
| `index.html` + `js/app.js` | Main app (search, results, detail modal, saved plans) |
| `admin.html` + `js/admin.js` | Catalog admin (draft, validate, download) |
| `js/logic.js` | Pure logic: filtering/sorting, booking links, validation |
| `js/i18n.js` | Hebrew/English locale packs |
| `data/activities.json` | The catalog (schema: `data/activities.schema.json`) |
| `mockup.html` | Original design-verification mockup (kept as reference) |

## Design docs

- Spec: [docs/superpowers/specs/2026-07-08-funday-design.md](docs/superpowers/specs/2026-07-08-funday-design.md)
- Implementation plan: [docs/superpowers/plans/2026-07-08-funday-v1.md](docs/superpowers/plans/2026-07-08-funday-v1.md)

## Out of scope for v1 (future)

User-generated reviews, real-time booking/payments, provider self-service portal, accounts/cross-device saved plans.
