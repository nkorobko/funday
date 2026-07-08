# FunDay — Design Spec

**Date**: 2026-07-08 (rev 2, same day — amended after stakeholder voice-note feedback)
**Status**: Approved design, rev 2 pending stakeholder verification via mockup
**Owner**: Noam Korobko (`github.com/nkorobko/funday`)

## Revision history

- **rev 1**: Curated-catalog filter tool — activity/city/budget/group inputs, result cards, saved plans.
- **rev 2**: Amended per stakeholder (EX manager) voice note: two markets (Israel + Dallas), bilingual UI, provider entity with contact details, activity detail view with curated rating/reviews link, and a "request booking" CTA. Architecture unchanged (still fully static).

## Purpose

A booking-oriented planning tool for Employee Experience managers organizing company fun days. The manager enters **Activity type**, **Region/City**, **Budget**, and **Group size**; the app shows matching activities from a curated provider catalog with the cost math done (group total, budget fit), a detail view per activity (description, provider, rating, reviews), and a one-click **booking request** to the provider.

Serves **two markets**: Israel (Hebrew, ₪) and Dallas, TX (English, $).

## Architecture

Fully static. Zero backend, zero secrets, zero monthly cost.

- Hosted on **GitHub Pages**, served straight from the `main` branch — a push is a deploy. Up 24/7.
- **No build step, no framework**: plain `index.html` + `app.js` + `style.css` + `data/activities.json`. If the UI later outgrows vanilla JS, moving to Vite is a contained change.
- **Bilingual + bi-directional**: Hebrew RTL for the Israel market, English LTR for Dallas. A locale layer (strings map + `dir`/`lang` switching) is built in from day one; a **region switcher** in the header selects market (filters catalog to that region, switches language, currency, and direction). Mobile-friendly.
- No LLM / external API for core function. Results are a deterministic client-side filter over the curated catalog.
- "Booking" in v1 is a **request flow, not a transaction**: prefilled WhatsApp (`wa.me`) and email (`mailto:`) messages to the provider containing the activity name, group size, and budget context. No availability, no payment — deliberately (see Out of scope).

## Components

### 1. Region switcher
- Header control: **ישראל (עברית)** / **Dallas (English)**.
- Switching sets: catalog subset (`region` field), UI language + `dir`, currency formatting, default cities list. Choice persisted in localStorage.

### 2. Search form
- **Activity category** — dropdown, populated from categories present in the selected region's catalog.
- **Area/City** — dropdown from the catalog (Israel: cities and areas like מרכז/צפון; Dallas: neighborhoods/suburbs).
- **Budget** — total budget in the region's currency.
- **Group size** — number of participants.
- Any field can be left as "all" / empty; filters combine with AND.

### 3. Results panel
Cards for each matching activity, sorted by budget fit then price:
- Name, short description, city, price per person, supported group range, **curated rating (stars)**.
- Computed total for the entered group size; budget-fit badge (within / over by X).
- Buttons: **Details** (opens detail view) and **Save**.
- Matching rules: category and city exact match (when set); group size within `[group_min, group_max]`; over-budget results still shown, flagged, sorted after within-budget results.

### 4. Activity detail view (modal)
- Full description, provider name, curated rating, link to provider website, link to external reviews (e.g., Google reviews URL).
- **Request-booking CTAs**: WhatsApp button (`wa.me/<phone>?text=<prefilled>`) and email button (`mailto:` with prefilled subject/body) — both include activity name, group size, and budget from the current search.

### 5. Saved plans
- "Save" stores the activity + search context (region, city, budget, group size) in **localStorage**. Single device, date-less wishlist.
- "My plans" view lists saved items with remove; print/share view via print stylesheet.

### 6. Catalog admin page (`admin.html`)
- Form to draft new activity entries (including provider contact fields) with validation.
- Produces the updated `activities.json` for download → committed via git or GitHub web editor.
- No write-backend: **the repo is the database; git history is the audit log**.

## Data model — `data/activities.json`

Array of entries:

```json
{
  "id": "escape-room-tlv-01",
  "region": "il",
  "name": "...",
  "category": "escape_room",
  "city": "תל אביב",
  "area": "מרכז",
  "currency": "ILS",
  "price_per_person": 120,
  "group_min": 4,
  "group_max": 30,
  "description": "...",
  "rating": 4.7,
  "reviews_link": "https://maps.google.com/...",
  "link": "https://provider-site...",
  "provider": {
    "name": "...",
    "phone": "+972...",
    "email": "book@..."
  },
  "tags": ["indoor", "team"]
}
```

- `id`: unique, kebab-case, stable. `region`: `"il"` | `"dallas"` (extensible).
- `category`: machine key (snake_case English); UI shows localized display names via a category map.
- `currency`: `"ILS"` | `"USD"` (must match region). `price_per_person`, `group_min` ≤ `group_max`: integers.
- `rating`: curated 1.0–5.0, optional. `reviews_link`: optional external reviews URL.
- `provider.phone` in E.164 (drives the `wa.me` link); `provider.email` drives `mailto:`.
- `tags`: optional, reserved for future filtering.
- A JSON Schema (`data/activities.schema.json`) is the source of truth for validity.

## Error handling

- Catalog fetch failure → friendly message with retry.
- Malformed catalog entries → skipped at load with `console.warn`; CI prevents them landing.
- Empty results → empty-state message suggesting loosening filters.
- Missing provider phone/email → the corresponding CTA button is hidden, not broken.

## Testing / CI

GitHub Action on PR and push to `main`:
1. Validate `data/activities.json` against the JSON Schema (including region/currency consistency).
2. Unit tests on pure logic: filtering, budget fit, sorting, and booking-message prefill construction.

## Out of scope for v1 — the backend frontier

Each of these is the point where a server becomes necessary; deferred deliberately:

- **User-generated reviews** (v1 uses curated rating + external reviews link).
- **Real-time booking**: availability, confirmation, payments (v1 uses request-by-WhatsApp/email).
- **Provider self-service portal** (v1: catalog curated via admin page + git).
- Accounts / multi-user / cross-device saved plans.
- LLM-generated suggestions.

## Constraints recap

- Must stay hostable on GitHub Pages (static only), accessible 24/7.
- $0/month infra; no secrets anywhere in the codebase.
- Solo maintainer, limited time — operational simplicity beats architectural purity.
- Completely separate from any Volumez repository or tooling.
