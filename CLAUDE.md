# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite)
npm run build      # Prebuild (generate community.json from env) + tsc + vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `VITE_MAPBOX_ACCESS_TOKEN` — Mapbox GL JS token (required for the map to render)
- `COMMUNITY_DATA` — JSON string of community members array (used by `scripts/generate-community-data.js` during `npm run build`); in dev, `src/data/community.json` is used directly

The `COMMUNITY_DATA` env var is only consumed at build time by the prebuild script, which writes `src/data/community.json`. In development, edit `src/data/community.json` directly.

## Architecture

Single-page React + Vite app. The entire UI is one component: `src/components/CommunityMap.tsx`.

**Data flow:**
- `src/data/community.json` — source of truth for member data at runtime. Each entry: `{ name, location, telegram, badge? }`.
- `cityCoordinates` map in `CommunityMap.tsx` — hardcoded `[lng, lat]` pairs keyed by the exact `"City, Country"` strings used in `community.json`. **When adding a new city, you must add its coordinates here.**
- `src/services/notion.ts` — Notion API integration (currently unused in the UI; was the intended live data source). Uses `VITE_NOTION_API_KEY` and `VITE_NOTION_DATABASE_ID`.

**Map behavior:**
- City markers (blue `#4361EE`) show member count, sized proportionally.
- Clicking a city marker or the city list (top-right panel) calls `expandCity()`, which flies the map to that city and spawns individual member markers (purple `#7B2D8B`) arranged in a circle.
- Clicking the same city again collapses the view.
- The bottom-left stats panel shows total member and city counts derived from the JSON.
- Mapbox CSS is loaded dynamically on mount rather than imported statically.
