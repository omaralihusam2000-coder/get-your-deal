import type { DealGame, StoreOffer } from "../types";

export function pickBest(offers: StoreOffer[], verifiedOnly = true): StoreOffer | null {
  const available = offers.filter((offer) => offer.available && (!verifiedOnly || offer.verified));
  if (!available.length) return null;
  return available.reduce((best, offer) =>
    offer.currentPrice.amount < best.currentPrice.amount ? offer : best,
  );
}

export function withBest(game: DealGame): DealGame {
  return { ...game, bestOffer: pickBest(game.offers) };
}

export async function mapPool<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  }
  const workers = Array.from({ length: Math.min(Math.max(limit, 1), items.length || 1) }, () => worker());
  await Promise.all(workers);
  return results;
}
