# DealForge

**Find the game. Compare the price. Get the best deal.**

DealForge is a premium PC game-deal discovery site. It compares **live Steam and GOG prices** so you can see which storefront is cheaper before you buy.

Prices are never invented. Listings come from:

- [CheapShark](https://www.cheapshark.com/api) public deal API (Steam store ID `1`, GOG store ID `7`)
- [Steam Store API](https://store.steampowered.com/api/appdetails) for artwork, descriptions, screenshots, system requirements, and regional prices
- [GOG Catalog API](https://catalog.gog.com/v1/catalog) for DRM-free listings and regional GOG prices
- [Frankfurter](https://www.frankfurter.app/) ECB rates when a listing must be converted between USD, EUR, and GBP

If a store or history source is unavailable, DealForge says so. It will not fabricate discounts, ratings, or a “best price ever” without recorded data.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Server API routes for store integrations, search, alerts, and currency

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start the production server
- `npm run lint` — ESLint

## Architecture

| Area | Location |
| --- | --- |
| UI | `app/`, `components/` |
| Store integrations | `lib/providers/steam.ts`, `lib/providers/gog.ts`, `lib/providers/cheapshark.ts` |
| Price data | `lib/deals/` |
| Currency | `lib/providers/fx.ts`, `lib/currency-server.ts` |
| Auth / favorites / alerts | `components/providers/AppProviders.tsx`, `app/api/alerts/route.ts` |
| Search | `app/api/search/route.ts`, `lib/deals/index.ts` |
| Analytics | `lib/analytics.ts` (on-device events) |

Email price alerts are created through CheapShark’s public alerts API. Favorites and the simple sign-in profile are stored on-device until a full auth backend is connected.

## Trust copy

Prices are checked from participating stores. Prices and availability can change at any time. DealForge may receive a commission from qualifying purchases.
