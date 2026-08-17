import "server-only";

import { STEAM_CC } from "../constants";
import { cached } from "../cache";
import { discountPercent, stripHtml } from "../format";
import { fetchJson, settled } from "../http";
import type { CurrencyCode, Money, StoreOffer } from "../types";
import { steamStoreUrl } from "./cheapshark";

const BASE = process.env.STEAM_STORE_API_BASE ?? "https://store.steampowered.com/api";

type SteamPriceOverview = {
  currency: string;
  initial: number;
  final: number;
  discount_percent: number;
  initial_formatted: string;
  final_formatted: string;
};

type SteamAppData = {
  name?: string;
  steam_appid?: number;
  short_description?: string;
  detailed_description?: string;
  about_the_game?: string;
  developers?: string[];
  publishers?: string[];
  release_date?: { coming_soon: boolean; date: string };
  genres?: Array<{ id: string; description: string }>;
  categories?: Array<{ id: number; description: string }>;
  screenshots?: Array<{ id: number; path_thumbnail: string; path_full: string }>;
  background?: string;
  background_raw?: string;
  header_image?: string;
  pc_requirements?: { minimum?: string; recommended?: string } | [];
  price_overview?: SteamPriceOverview;
  is_free?: boolean;
  metacritic?: { score: number; url: string };
};

type SteamAppResponse = Record<string, { success: boolean; data?: SteamAppData }>;

export type SteamDetails = {
  appId: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  developers: string[];
  publishers: string[];
  releaseDate: string | null;
  genres: string[];
  playModes: Array<"single" | "multi">;
  screenshots: string[];
  background: string | null;
  header: string | null;
  systemRequirements: { minimum: string | null; recommended: string | null };
  offer: StoreOffer | null;
  metacritic: number | null;
  userRating: {
    text: string | null;
    percent: number | null;
    count: number | null;
  } | null;
};

function moneyFromSteam(overview: SteamPriceOverview, currency: CurrencyCode): Money | null {
  if (overview.currency !== currency) return null;
  return { amount: overview.final / 100, currency };
}

function originalFromSteam(overview: SteamPriceOverview, currency: CurrencyCode): Money | null {
  if (overview.currency !== currency) return null;
  return { amount: overview.initial / 100, currency };
}

function playModesFromCategories(categories: SteamAppData["categories"]): Array<"single" | "multi"> {
  const modes = new Set<"single" | "multi">();
  for (const category of categories ?? []) {
    const name = category.description.toLowerCase();
    if (name.includes("single-player") || name.includes("single player")) modes.add("single");
    if (name.includes("multi-player") || name.includes("multiplayer") || name.includes("co-op")) {
      modes.add("multi");
    }
  }
  return [...modes];
}

export async function fetchSteamApp(
  appId: string,
  currency: CurrencyCode = "USD",
): Promise<SteamDetails | null> {
  return cached(`steam:${appId}:${currency}`, 30 * 60 * 1000, async () => {
    const url = `${BASE}/appdetails?appids=${encodeURIComponent(appId)}&cc=${STEAM_CC[currency]}&l=en`;
    const json = await fetchJson<SteamAppResponse>(url, { revalidate: 1800 });
    const entry = json[appId];
    if (!entry?.success || !entry.data) return null;
    const data = entry.data;
    const requirements = Array.isArray(data.pc_requirements) ? {} : data.pc_requirements;

    let offer: StoreOffer | null = null;
    if (data.price_overview && data.price_overview.currency === currency) {
      const current = moneyFromSteam(data.price_overview, currency);
      const original = originalFromSteam(data.price_overview, currency);
      if (current && original) {
        offer = {
          store: "steam",
          storeName: "Steam",
          dealId: null,
          storeGameId: appId,
          currentPrice: current,
          originalPrice: original,
          discountPercent: data.price_overview.discount_percent || discountPercent(current.amount, original.amount),
          url: steamStoreUrl(appId),
          available: true,
          lastChange: null,
        };
      }
    } else if (data.is_free) {
      offer = {
        store: "steam",
        storeName: "Steam",
        dealId: null,
        storeGameId: appId,
        currentPrice: { amount: 0, currency },
        originalPrice: { amount: 0, currency },
        discountPercent: 0,
        url: steamStoreUrl(appId),
        available: true,
        lastChange: null,
      };
    }

    return {
      appId,
      name: data.name ?? `Steam ${appId}`,
      shortDescription: stripHtml(data.short_description),
      description: stripHtml(data.detailed_description ?? data.about_the_game),
      developers: data.developers ?? [],
      publishers: data.publishers ?? [],
      releaseDate: data.release_date?.date || null,
      genres: (data.genres ?? []).map((genre) => genre.description).filter(Boolean),
      playModes: playModesFromCategories(data.categories),
      screenshots: (data.screenshots ?? []).map((shot) => shot.path_full).filter(Boolean),
      background: data.background_raw || data.background || null,
      header: data.header_image || null,
      systemRequirements: {
        minimum: stripHtml(requirements?.minimum),
        recommended: stripHtml(requirements?.recommended),
      },
      offer,
      metacritic: data.metacritic?.score ?? null,
      userRating: await fetchSteamReviews(appId),
    };
  });
}

export async function fetchSteamAppSafe(appId: string | null, currency: CurrencyCode) {
  if (!appId) return { ok: false as const, error: "missing" };
  return settled(fetchSteamApp(appId, currency));
}

async function fetchSteamReviews(appId: string) {
  const url = `https://store.steampowered.com/appreviews/${encodeURIComponent(appId)}?json=1&language=all&purchase_type=all&num_per_page=0`;
  const result = await settled(
    fetchJson<{
      success: number;
      query_summary?: {
        review_score_desc?: string;
        total_positive?: number;
        total_reviews?: number;
      };
    }>(url, { revalidate: 3600 }),
  );
  if (!result.ok || !result.value.query_summary?.total_reviews) return null;
  const summary = result.value.query_summary;
  const count = summary.total_reviews ?? 0;
  const positive = summary.total_positive ?? 0;
  return {
    text: summary.review_score_desc ?? null,
    percent: count > 0 ? Math.round((positive / count) * 100) : null,
    count,
  };
}
