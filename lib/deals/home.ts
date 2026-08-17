import "server-only";

import { featuredComparison, queryDeals } from "./index";
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

function take(games: DealGame[], count = 4) {
  return games.slice(0, count);
}

export async function getHomeData(currency: CurrencyCode): Promise<HomeData> {
  const [best, drops, newest, featured] = await Promise.all([
    queryDeals({ sort: "deal", onSale: true, pageSize: 40, currency }),
    queryDeals({ sort: "discount", onSale: true, pageSize: 40, currency }),
    queryDeals({ sort: "newest", onSale: true, pageSize: 12, currency }),
    featuredComparison(currency),
  ]);

  const pool = unique([...best.games, ...drops.games, ...newest.games]);

  const trending = pool.filter((game) => (game.steamRatingPercent ?? 0) >= 80);
  const under10 = pool.filter((game) => (game.bestOffer?.currentPrice.amount ?? 99) <= 10);
  const gems = pool.filter((game) => Math.max(...game.offers.map((offer) => offer.discountPercent), 0) >= 70);

  return {
    best: take(best.games),
    drops: take(drops.games),
    recent: take(newest.games.length ? newest.games : [...pool].sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0))),
    trending: take(trending.length ? trending : best.games),
    under10: take(under10.length ? under10 : pool.filter((game) => (game.bestOffer?.currentPrice.amount ?? 99) <= 15)),
    gems: take(gems.length ? gems : drops.games),
    featured,
    sources: best.sources,
    notice: best.notice,
  };
}
