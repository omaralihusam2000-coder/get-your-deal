import "server-only";

import { featuredComparison, queryDeals } from "./index";
import { hydrateOfficialPrices } from "./official";
import type { CurrencyCode, DealGame, DealListResult, GameDetails } from "../types";

export type HomeData = {
  best: DealGame[];
  drops: DealGame[];
  recent: DealGame[];
  trending: DealGame[];
  under10: DealGame[];
  gems: DealGame[];
  featured: GameDetails | null;
  sources: DealListResult["sources"];
  notice: string | null;
};

function unique(games: DealGame[]) {
  const map = new Map<string, DealGame>();
  for (const game of games) map.set(game.gameId, game);
  return [...map.values()];
}

function takeLive(list: DealGame[], live: Map<string, DealGame>, count = 4) {
  const out: DealGame[] = [];
  for (const game of list) {
    const hydrated = live.get(game.gameId);
    if (hydrated?.offers.length) out.push(hydrated);
    if (out.length === count) break;
  }
  return out;
}

export async function getHomeData(currency: CurrencyCode): Promise<HomeData> {
  const [best, drops, newest, featured] = await Promise.all([
    queryDeals({ sort: "deal", onSale: true, pageSize: 40, currency, hydrate: false }),
    queryDeals({ sort: "discount", onSale: true, pageSize: 40, currency, hydrate: false }),
    queryDeals({ sort: "newest", onSale: true, pageSize: 12, currency, hydrate: false }),
    featuredComparison(currency),
  ]);

  const candidates = unique([
    ...best.games.slice(0, 10),
    ...drops.games.slice(0, 10),
    ...newest.games.slice(0, 8),
  ]);
  const live = await hydrateOfficialPrices(candidates, currency);
  const liveMap = new Map(live.games.map((game) => [game.gameId, game]));
  const pool = live.games.filter((game) => game.offers.some((offer) => offer.verified));

  const trending = pool.filter((game) => (game.steamRatingPercent ?? 0) >= 80);
  const under10 = pool.filter((game) => (game.bestOffer?.currentPrice.amount ?? 99) <= 10);
  const gems = pool.filter((game) => Math.max(...game.offers.map((offer) => offer.discountPercent), 0) >= 70);

  const sources = {
    ...best.sources,
    steam: live.steam,
    gog: live.gog,
  };

  return {
    best: takeLive(best.games, liveMap),
    drops: takeLive(drops.games, liveMap),
    recent: takeLive(newest.games, liveMap),
    trending: trending.slice(0, 4),
    under10: under10.slice(0, 4),
    gems: gems.slice(0, 4),
    featured,
    sources,
    notice: best.notice,
  };
}
