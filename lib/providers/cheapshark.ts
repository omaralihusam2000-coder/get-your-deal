import "server-only";

import { GOG_STORE_ID, STEAM_STORE_ID, STORE_NAMES } from "../constants";
import { discountPercent, parsePrice, unixToIso } from "../format";
import { fetchJson, fetchText } from "../http";
import type { CurrencyCode, Money, StoreOffer, StoreSlug } from "../types";

const BASE =
  process.env.CHEAPSHARK_API_BASE ?? "https://www.cheapshark.com/api/1.0";

export type CheapSharkDeal = {
  internalName: string;
  title: string;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string | null;
  steamRatingPercent: string;
  steamRatingCount: string;
  steamAppID: string | null;
  releaseDate: number;
  lastChange: number;
  dealRating: string;
  thumb: string;
};

export type CheapSharkGameSearch = {
  gameID: string;
  steamAppID: string | null;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  internalName: string;
  thumb: string;
};

export type CheapSharkGameLookup = {
  info: {
    title: string;
    steamAppID: string | null;
    thumb: string;
  };
  cheapestPriceEver: {
    price: string;
    date: number;
  } | null;
  deals: Array<{
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string;
  }>;
};

export function steamArtwork(appId: string | null | undefined, kind: "header" | "hero" | "capsule") {
  if (!appId) return null;
  const file =
    kind === "header"
      ? "header.jpg"
      : kind === "hero"
        ? "library_hero.jpg"
        : "capsule_616x353.jpg";
  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/${file}`;
}

export function cheapSharkRedirect(dealId: string) {
  return `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealId)}`;
}

export function steamStoreUrl(appId: string) {
  return `https://store.steampowered.com/app/${appId}/`;
}

function usd(amount: number): Money {
  return { amount, currency: "USD" };
}

function storeFromId(storeId: string): StoreSlug | null {
  if (storeId === STEAM_STORE_ID) return "steam";
  if (storeId === GOG_STORE_ID) return "gog";
  return null;
}

export function offerFromCheapSharkDeal(
  deal: Pick<CheapSharkDeal, "storeID" | "dealID" | "salePrice" | "normalPrice" | "steamAppID" | "lastChange">,
  currency: CurrencyCode = "USD",
): StoreOffer | null {
  const store = storeFromId(deal.storeID);
  if (!store) return null;
  const current = parsePrice(deal.salePrice);
  const original = parsePrice(deal.normalPrice);
  if (current === null || original === null) return null;

  const url =
    store === "steam" && deal.steamAppID
      ? steamStoreUrl(deal.steamAppID)
      : cheapSharkRedirect(deal.dealID);

  return {
    store,
    storeName: STORE_NAMES[store],
    dealId: deal.dealID,
    storeGameId: store === "steam" ? deal.steamAppID : null,
    currentPrice: { amount: current, currency },
    originalPrice: { amount: original, currency },
    discountPercent: discountPercent(current, original),
    url,
    available: true,
    lastChange: unixToIso(deal.lastChange),
    verified: false,
  };
}

export function offerFromLookupDeal(
  deal: CheapSharkGameLookup["deals"][number],
  steamAppId: string | null,
  currency: CurrencyCode = "USD",
): StoreOffer | null {
  const store = storeFromId(deal.storeID);
  if (!store) return null;
  const current = parsePrice(deal.price);
  const original = parsePrice(deal.retailPrice);
  if (current === null || original === null) return null;
  const url =
    store === "steam" && steamAppId
      ? steamStoreUrl(steamAppId)
      : cheapSharkRedirect(deal.dealID);

  return {
    store,
    storeName: STORE_NAMES[store],
    dealId: deal.dealID,
    storeGameId: store === "steam" ? steamAppId : null,
    currentPrice: { amount: current, currency },
    originalPrice: { amount: original, currency },
    discountPercent: discountPercent(current, original),
    url,
    available: true,
    lastChange: null,
    verified: false,
  };
}

type DealsParams = {
  storeIDs?: string;
  title?: string;
  upperPrice?: number;
  lowerPrice?: number;
  onSale?: boolean;
  sortBy?: string;
  pageNumber?: number;
  pageSize?: number;
  steamRating?: number;
  metacritic?: number;
  AAA?: boolean;
  desc?: boolean;
};

export async function fetchCheapSharkDeals(params: DealsParams): Promise<CheapSharkDeal[]> {
  const url = new URL(`${BASE}/deals`);
  url.searchParams.set("storeID", params.storeIDs ?? `${STEAM_STORE_ID},${GOG_STORE_ID}`);
  url.searchParams.set("pageSize", String(Math.min(params.pageSize ?? 20, 60)));
  url.searchParams.set("pageNumber", String(params.pageNumber ?? 0));
  if (params.title) url.searchParams.set("title", params.title);
  if (params.upperPrice !== undefined) url.searchParams.set("upperPrice", String(params.upperPrice));
  if (params.lowerPrice !== undefined) url.searchParams.set("lowerPrice", String(params.lowerPrice));
  if (params.onSale) url.searchParams.set("onSale", "1");
  if (params.sortBy) url.searchParams.set("sortBy", params.sortBy);
  if (params.steamRating !== undefined) url.searchParams.set("steamRating", String(params.steamRating));
  if (params.metacritic !== undefined) url.searchParams.set("metacritic", String(params.metacritic));
  if (params.AAA) url.searchParams.set("AAA", "1");
  if (params.desc === false) url.searchParams.set("desc", "0");

  return fetchJson<CheapSharkDeal[]>(url.toString(), { revalidate: 300 });
}

export async function searchCheapSharkGames(title: string, limit = 12): Promise<CheapSharkGameSearch[]> {
  const url = new URL(`${BASE}/games`);
  url.searchParams.set("title", title);
  url.searchParams.set("limit", String(limit));
  return fetchJson<CheapSharkGameSearch[]>(url.toString(), { revalidate: 120 });
}

export async function lookupCheapSharkGame(id: string): Promise<CheapSharkGameLookup | null> {
  const url = new URL(`${BASE}/games`);
  url.searchParams.set("id", id);
  const data = await fetchJson<CheapSharkGameLookup | CheapSharkGameLookup[]>(url.toString(), {
    revalidate: 180,
  });
  if (Array.isArray(data)) return data[0] ?? null;
  if (!data || !("info" in data)) return null;
  return data;
}

export async function lookupCheapSharkGames(ids: string[]): Promise<Record<string, CheapSharkGameLookup>> {
  if (ids.length === 0) return {};
  const unique = [...new Set(ids)].slice(0, 25);
  const url = new URL(`${BASE}/games`);
  url.searchParams.set("ids", unique.join(","));
  return fetchJson<Record<string, CheapSharkGameLookup>>(url.toString(), { revalidate: 180 });
}

export async function setCheapSharkAlert(email: string, gameID: string, price: number) {
  const url = new URL(`${BASE}/alerts`);
  url.searchParams.set("action", "set");
  url.searchParams.set("email", email);
  url.searchParams.set("gameID", gameID);
  url.searchParams.set("price", String(price));
  return fetchText(url.toString(), { revalidate: 0 });
}

export async function deleteCheapSharkAlert(email: string, gameID: string) {
  const url = new URL(`${BASE}/alerts`);
  url.searchParams.set("action", "delete");
  url.searchParams.set("email", email);
  url.searchParams.set("gameID", gameID);
  return fetchText(url.toString(), { revalidate: 0 });
}

export { usd };
