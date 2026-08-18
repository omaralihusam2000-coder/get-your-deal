import "server-only";

import { GOG_REGION } from "../constants";
import { cached } from "../cache";
import { discountPercent, normalizeTitle, stripHtml } from "../format";
import { fetchJson, settled } from "../http";
import type { CurrencyCode, StoreOffer } from "../types";
import { gogStoreUrl } from "../store-links";

const CATALOG = process.env.GOG_CATALOG_API_BASE ?? "https://catalog.gog.com/v1/catalog";
const PRODUCTS = process.env.GOG_PRODUCTS_API_BASE ?? "https://api.gog.com/products";

type GogCatalogProduct = {
  id: string;
  slug: string;
  title: string;
  coverHorizontal?: string;
  coverVertical?: string;
  developers?: string[];
  publishers?: string[];
  genres?: Array<{ name: string; slug: string }>;
  screenshots?: string[];
  productType?: string;
  releaseDate?: string | null;
  features?: Array<{ name: string; slug: string }>;
  price?: {
    final?: string;
    base?: string;
    discount?: number | string;
    currency?: string;
    finalMoney?: { amount: string; currency: string };
    baseMoney?: { amount: string; currency: string };
  };
};

type GogCatalogResponse = {
  products?: GogCatalogProduct[];
};

type GogProduct = {
  id: number;
  title: string;
  slug?: string;
  description?: { lead?: string; full?: string; whats_cool_about_it?: string };
  screenshots?: Array<{ image_id?: string; formatter_url?: string } | string>;
  developers?: Array<{ name?: string } | string>;
  publishers?: Array<{ name?: string } | string>;
};

export type GogDetails = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  shortDescription: string | null;
  developers: string[];
  publishers: string[];
  genres: string[];
  playModes: Array<"single" | "multi">;
  screenshots: string[];
  cover: string | null;
  releaseDate: string | null;
  offer: StoreOffer | null;
  url: string | null;
};

function gogUrl(slug: string | null, id?: string) {
  if (slug) return gogStoreUrl(slug);
  if (id) return gogStoreUrl(id);
  return null;
}

function formatGogScreenshot(url: string) {
  return url.replace("{formatter}", "product_screenshot_1920");
}

function parseGogAmount(product: GogCatalogProduct): { current: number; original: number; currency: string } | null {
  const finalMoney = product.price?.finalMoney;
  const baseMoney = product.price?.baseMoney;
  if (finalMoney?.amount) {
    const current = Number.parseFloat(finalMoney.amount);
    const original = Number.parseFloat(baseMoney?.amount ?? finalMoney.amount);
    if (Number.isFinite(current)) {
      return {
        current,
        original: Number.isFinite(original) ? original : current,
        currency: finalMoney.currency || product.price?.currency || "USD",
      };
    }
  }

  const finalRaw = product.price?.final;
  if (finalRaw) {
    const current = Number.parseFloat(finalRaw.replace(/[^0-9.]/g, ""));
    const original = Number.parseFloat((product.price?.base ?? finalRaw).replace(/[^0-9.]/g, ""));
    if (Number.isFinite(current)) {
      return {
        current,
        original: Number.isFinite(original) ? original : current,
        currency: product.price?.currency || "USD",
      };
    }
  }
  return null;
}

function playModesFromFeatures(features: GogCatalogProduct["features"]): Array<"single" | "multi"> {
  const modes = new Set<"single" | "multi">();
  for (const feature of features ?? []) {
    const slug = feature.slug.toLowerCase();
    if (slug.includes("single")) modes.add("single");
    if (slug.includes("multi") || slug.includes("coop") || slug.includes("co-op")) modes.add("multi");
  }
  return [...modes];
}

function offerFromProduct(product: GogCatalogProduct, currency: CurrencyCode): StoreOffer | null {
  const parsed = parseGogAmount(product);
  if (!parsed || parsed.currency !== currency) return null;
  const url = gogUrl(product.slug, product.id);
  if (!url) return null;
  return {
    store: "gog",
    storeName: "GOG",
    dealId: null,
    storeGameId: product.id,
    currentPrice: { amount: parsed.current, currency },
    originalPrice: { amount: parsed.original, currency },
    discountPercent: discountPercent(parsed.current, parsed.original),
    url,
    available: true,
    lastChange: null,
    verified: true,
  };
}

export async function searchGogCatalog(
  query: string,
  currency: CurrencyCode,
  extra: Record<string, string> = {},
): Promise<GogCatalogProduct[]> {
  const region = GOG_REGION[currency];
  const url = new URL(CATALOG);
  url.searchParams.set("limit", extra.limit ?? "20");
  url.searchParams.set("query", `like:${query}`);
  url.searchParams.set("countryCode", region.country);
  url.searchParams.set("currencyCode", region.currency);
  url.searchParams.set("order", extra.order ?? "desc:score");
  if (extra.genre) url.searchParams.set("genres", extra.genre.toLowerCase());
  Object.entries(extra).forEach(([key, value]) => {
    if (key === "limit" || key === "order" || key === "genre") return;
    url.searchParams.set(key, value);
  });
  const data = await fetchJson<GogCatalogResponse>(url.toString(), { revalidate: 600 });
  return data.products ?? [];
}

export async function fetchGogByTitle(title: string, currency: CurrencyCode): Promise<GogDetails | null> {
  return cached(`gog:title:${normalizeTitle(title)}:${currency}`, 30 * 60 * 1000, async () => {
    const products = await searchGogCatalog(title, currency, { limit: "8" });
    const exact = products.find((product) => normalizeTitle(product.title) === normalizeTitle(title));
    if (!exact) return null;
    return detailsFromCatalog(exact, currency);
  });
}

export async function fetchGogProduct(id: string, currency: CurrencyCode): Promise<GogDetails | null> {
  return cached(`gog:id:${id}:${currency}`, 30 * 60 * 1000, async () => {
    const url = `${PRODUCTS}/${id}?expand=description,screenshots`;
    const product = await fetchJson<GogProduct>(url, { revalidate: 1800 });
    const catalog = await searchGogCatalog(product.title, currency, { limit: "8" });
    const match =
      catalog.find((item) => item.id === String(product.id)) ??
      catalog.find((item) => normalizeTitle(item.title) === normalizeTitle(product.title));

    const screenshots = (product.screenshots ?? [])
      .map((shot) => {
        if (typeof shot === "string") return formatGogScreenshot(shot);
        if (shot.formatter_url) return formatGogScreenshot(shot.formatter_url);
        return null;
      })
      .filter((shot): shot is string => Boolean(shot));

    const names = (value: GogProduct["developers"]) =>
      (value ?? [])
        .map((item) => (typeof item === "string" ? item : item.name))
        .filter((item): item is string => Boolean(item));

    return {
      id: String(product.id),
      slug: product.slug ?? match?.slug ?? null,
      title: product.title,
      description: stripHtml(product.description?.full),
      shortDescription: stripHtml(product.description?.lead),
      developers: names(product.developers),
      publishers: names(product.publishers),
      genres: match?.genres?.map((genre) => genre.name) ?? [],
      playModes: playModesFromFeatures(match?.features),
      screenshots: screenshots.length ? screenshots : (match?.screenshots ?? []).map(formatGogScreenshot),
      cover: match?.coverHorizontal ?? null,
      releaseDate: match?.releaseDate ?? null,
      offer: match ? offerFromProduct(match, currency) : null,
      url: gogUrl(product.slug ?? match?.slug ?? null, String(product.id)),
    };
  });
}

function detailsFromCatalog(product: GogCatalogProduct, currency: CurrencyCode): GogDetails {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: null,
    shortDescription: null,
    developers: product.developers ?? [],
    publishers: product.publishers ?? [],
    genres: (product.genres ?? []).map((genre) => genre.name),
    playModes: playModesFromFeatures(product.features),
    screenshots: (product.screenshots ?? []).map(formatGogScreenshot),
    cover: product.coverHorizontal || product.coverVertical || null,
    releaseDate: product.releaseDate ?? null,
    offer: offerFromProduct(product, currency),
    url: gogUrl(product.slug, product.id),
  };
}

export async function fetchGogByTitleSafe(title: string, currency: CurrencyCode) {
  return settled(fetchGogByTitle(title, currency));
}

export { detailsFromCatalog };
export type { GogCatalogProduct };
