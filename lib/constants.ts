import type { CurrencyCode, DealSort, StoreSlug } from "./types";

export const APP_NAME = "DealForge";
export const APP_TAGLINE = "Find the game. Compare the price. Get the best deal.";

export const STEAM_STORE_ID = "1";
export const GOG_STORE_ID = "7";

export const STORE_IDS: Record<StoreSlug, string> = {
  steam: STEAM_STORE_ID,
  gog: GOG_STORE_ID,
};

export const STORE_NAMES: Record<StoreSlug, string> = {
  steam: "Steam",
  gog: "GOG",
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
};

export const STEAM_CC: Record<CurrencyCode, string> = {
  USD: "us",
  EUR: "de",
  GBP: "gb",
};

export const GOG_REGION: Record<CurrencyCode, { country: string; currency: string }> = {
  USD: { country: "US", currency: "USD" },
  EUR: { country: "DE", currency: "EUR" },
  GBP: { country: "GB", currency: "GBP" },
};

export const GENRES = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Simulation",
  "Indie",
  "Sports",
  "Racing",
  "Horror",
  "Puzzle",
  "Survival",
  "Shooter",
] as const;

export const SORT_OPTIONS: { value: DealSort; label: string }[] = [
  { value: "deal", label: "Best Deal" },
  { value: "price", label: "Lowest Price" },
  { value: "discount", label: "Biggest Discount" },
  { value: "rated", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "history", label: "Price History" },
];

export const CHEAPSHARK_SORT: Record<DealSort, string> = {
  deal: "Deal Rating",
  price: "Price",
  discount: "Savings",
  rated: "Reviews",
  newest: "Release",
  history: "Savings",
};

export const TRUST_COPY =
  "Prices are checked from participating stores. Prices and availability can change at any time. DealForge may receive a commission from qualifying purchases.";

export const RECENT_RELEASE_MS = 1000 * 60 * 60 * 24 * 365;
