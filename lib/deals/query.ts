import type { CurrencyCode, DealQuery, DealSort, PlayMode, StoreFilter } from "../types";

function num(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function bool(value: string | undefined) {
  return value === "1" || value === "true";
}

export function parseDealQuery(searchParams: Record<string, string | string[] | undefined>, defaults: Partial<DealQuery> = {}): DealQuery {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const store = (get("store") as StoreFilter | undefined) ?? defaults.store ?? "both";
  const sort = (get("sort") as DealSort | undefined) ?? defaults.sort ?? "deal";
  const playMode = (get("play") as PlayMode | undefined) ?? "any";
  const currency = (get("currency") as CurrencyCode | undefined) ?? defaults.currency ?? "USD";

  return {
    store: ["steam", "gog", "both"].includes(store) ? store : "both",
    q: get("q") || defaults.q,
    genre: get("genre") || undefined,
    minPrice: num(get("minPrice")),
    maxPrice: num(get("maxPrice")),
    minDiscount: num(get("minDiscount")),
    year: num(get("year")),
    minRating: num(get("minRating")),
    playMode: ["any", "single", "multi"].includes(playMode) ? playMode : "any",
    recentlyReleased: bool(get("recent")),
    bestValue: bool(get("bestValue")),
    biggestDiscount: bool(get("biggest")),
    sort: ["deal", "price", "discount", "rated", "newest", "history"].includes(sort) ? sort : "deal",
    page: num(get("page")) ?? 0,
    pageSize: num(get("pageSize")) ?? defaults.pageSize ?? 20,
    onSale: defaults.onSale,
    currency: ["USD", "EUR", "GBP"].includes(currency) ? currency : "USD",
  };
}

export function toSearchParams(query: DealQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.store && query.store !== "both") params.set("store", query.store);
  if (query.q) params.set("q", query.q);
  if (query.genre) params.set("genre", query.genre);
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.minDiscount !== undefined) params.set("minDiscount", String(query.minDiscount));
  if (query.year !== undefined) params.set("year", String(query.year));
  if (query.minRating !== undefined) params.set("minRating", String(query.minRating));
  if (query.playMode && query.playMode !== "any") params.set("play", query.playMode);
  if (query.recentlyReleased) params.set("recent", "1");
  if (query.bestValue) params.set("bestValue", "1");
  if (query.biggestDiscount) params.set("biggest", "1");
  if (query.sort && query.sort !== "deal") params.set("sort", query.sort);
  if (query.currency && query.currency !== "USD") params.set("currency", query.currency);
  if (query.page) params.set("page", String(query.page));
  return params;
}
