# FunDay — Design Spec

**Date**: 2026-07-08
**Status**: Approved (design gate passed)
**Owner**: Noam Korobko (`github.com/nkorobko/funday`)

## Purpose

A planning tool for an Employee Experience manager. She enters **Activity type**, **City**, **Budget**, and **Group size**; the app instantly shows matching activities from a curated catalog, with the cost math done for her (total for the group, budget fit).

Origin: paper sketch — a "Fun Day" form with four inputs (Activity, City, Budget, Group of) feeding a large Result area.

## Architecture

Fully static. Zero backend, zero secrets, zero monthly cost.

- Hosted on **GitHub Pages**, served straight from the `main` branch — a push is a deploy. Up 24/7.
- **No build step, no framework**: plain `index.html` + `app.js` + `style.css` + `data/activities.json`. If the UI later outgrows vanilla JS, moving to Vite is a contained change.
- **Hebrew-first, RTL layout**, mobile-friendly. Currency in ₪.
- No LLM / external API. Results are a deterministic client-side filter over the curated catalog (explicit decision — an earlier LLM-backed design was rejected as unnecessary).

## Components

### 1. Search form
- **Activity category** — dropdown, populated from categories present in the catalog.
- **City** — dropdown, populated from cities present in the catalog.
- **Budget** — total budget in ₪ (number).
- **Group size** — number of participants.
- Any field can be left as "all" / empty; filters combine with AND.

### 2. Results panel
Cards for each matching activity, sorted by budget fit:
- Name, description, city, price per person, supported group range.
- Computed total for the entered group size.
- Budget-fit badge: "בתקציב" (within budget) / "חורג ב-₪X" (over by ₪X).
- External link (venue site / Google Maps).
- Matching rules: category and city exact match (when set); group size within `[group_min, group_max]`; results over budget are still shown, flagged, and sorted after within-budget results.

### 3. Saved plans
- "Save" on any result card stores it in **localStorage** together with the search context (city, budget, group size). Date-less wishlist, single device.
- "My plans" view lists saved items with remove.
- Clean print/share view (browser print stylesheet) to send to the team.

### 4. Catalog admin page (`admin.html`)
- Form to draft new activity entries with validation.
- Loads the current catalog, appends the new entry, offers the updated `activities.json` for **download** — to be committed via git or GitHub's web editor.
- No write-backend: **the repo is the database; git history is the audit log**.

## Data model — `data/activities.json`

Array of entries:

```json
{
  "id": "escape-room-tlv-01",
  "name": "...",
  "category": "escape_room",
  "city": "תל אביב",
  "price_per_person": 120,
  "group_min": 4,
  "group_max": 30,
  "description": "...",
  "link": "https://...",
  "tags": ["indoor", "team"]
}
```

- `id`: unique, kebab-case, stable.
- `category`: machine key (snake_case English); UI shows a Hebrew display name via a category map in the app.
- `price_per_person`: integer ₪. `group_min`/`group_max`: integers, `min <= max`.
- `tags`: optional, free-form, reserved for future filtering.
- A JSON Schema (`data/activities.schema.json`) is the source of truth for validity.

## Error handling

- Catalog fetch failure → friendly message with a retry button.
- Malformed catalog entries → skipped at load with a `console.warn`; CI prevents them from landing in the first place.
- Empty results → empty-state message suggesting loosening filters.

## Testing / CI

GitHub Action on PR and push to `main`:
1. Validate `data/activities.json` against the JSON Schema (the main rot risk).
2. Unit tests on the pure filter/budget-fit/sort logic (node test runner or vitest).

## Out of scope for v1 (future options)

- Accounts / multi-user / cross-device saved plans.
- LLM-generated suggestions.
- Live venue pricing or booking.
- Auto-generated external search links for uncovered cities/categories.

## Constraints recap

- Must stay hostable on GitHub Pages (static only), accessible 24/7.
- $0/month infra; no secrets anywhere in the codebase.
- Solo maintainer, limited time — operational simplicity beats architectural purity.
- Completely separate from any Volumez repository or tooling.
