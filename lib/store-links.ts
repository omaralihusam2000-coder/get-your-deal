import type { StoreOffer, StoreSlug } from "./types";

export function steamStoreUrl(appId: string) {
  return `https://store.steampowered.com/app/${encodeURIComponent(appId)}/`;
}

export function gogStoreUrl(slug: string) {
  const clean = slug.replace(/^\/+/, "").replace(/^en\/game\//, "");
  return `https://www.gog.com/en/game/${clean}`;
}

export function isOfficialStoreUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "store.steampowered.com") return /\/app\/\d+/.test(parsed.pathname);
    if (host === "gog.com") return /\/(?:en\/)?game\/[A-Za-z0-9_-]+/.test(parsed.pathname);
    return false;
  } catch {
    return false;
  }
}

export function officialDealUrl(offer: StoreOffer | null | undefined): string | null {
  if (!offer) return null;
  return isOfficialStoreUrl(offer.url) ? offer.url : null;
}

export function officialDealLabel(store: StoreSlug) {
  return store === "steam" ? "Get on Steam" : "Get on GOG";
}
