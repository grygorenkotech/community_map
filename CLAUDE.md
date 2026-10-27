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
- `NOTION_TOKEN` + `NOTION_DATABASE_ID` — members database in Notion (preferred data source). The prebuild script takes rows with `Status = active` and a non-empty `Location`. Build-time only, never exposed to the browser.
- `COMMUNITY_DATA` — JSON string of community members array; fallback when the Notion variables are not set

The prebuild script (`scripts/generate-community-data.js`) writes `src/data/community.json`. Cities missing from `cityCoordinates` are geocoded via Mapbox at build time and stored as `coordinates` on each member. In development, edit `src/data/community.json` directly.

## Architecture

Single-page React + Vite app. The entire UI is one component: `src/components/CommunityMap.tsx`.

**Data flow:**
- `src/data/community.json` — source of truth for member data at runtime. Each entry: `{ name, location, telegram, badge? }`.
- `cityCoordinates` map in `CommunityMap.tsx` — hardcoded `[lng, lat]` pairs keyed by the exact `"City, Country"` strings used in `community.json`. Cities not listed here are geocoded at build time; members whose city can't be resolved are left off the map.
- `src/services/notion.ts` — Notion API integration (currently unused in the UI; was the intended live data source). Uses `VITE_NOTION_API_KEY` and `VITE_NOTION_DATABASE_ID`.

**Map behavior:**
- City markers (blue `#4361EE`) show member count, sized proportionally.
- Clicking a city marker or the city list (top-right panel) calls `expandCity()`, which flies the map to that city and spawns individual member markers (purple `#7B2D8B`) arranged in a circle.
- Clicking the same city again collapses the view.
- The bottom-left stats panel shows total member and city counts derived from the JSON.
- Mapbox CSS is loaded dynamically on mount rather than imported statically.
