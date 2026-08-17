import "server-only";

import type { CurrencyCode, DealGame, SourceStatus, StoreOffer } from "../types";
import { settled } from "../http";
import { fetchSteamPrice } from "../providers/steam";
import { fetchGogByTitleSafe } from "../providers/gog";
import { mapPool, pickBest, withBest } from "./helpers";

export async function hydrateOfficialPrices(
  games: DealGame[],
  currency: CurrencyCode,
  options: { steam?: boolean; gog?: boolean } = {},
): Promise<{ games: DealGame[]; steam: SourceStatus; gog: SourceStatus }> {
  const wantSteam = options.steam !== false;
  const wantGog = options.gog !== false;
  let steam: SourceStatus = wantSteam ? "ok" : "skipped";
  let gog: SourceStatus = wantGog ? "ok" : "skipped";

  const updated = await mapPool(games, 6, async (game) => {
    const previousSteam = game.offers.find((offer) => offer.store === "steam");
    const previousGog = game.offers.find((offer) => offer.store === "gog");
    const offers: StoreOffer[] = [];

    if (wantSteam && game.steamAppId) {
      const result = await settled(fetchSteamPrice(game.steamAppId, currency));
      if (!result.ok) steam = "unavailable";
      else if (result.value) {
        offers.push({
          ...result.value,
          dealId: previousSteam?.dealId ?? result.value.dealId,
        });
      }
    }

    if (wantGog) {
      const result = await fetchGogByTitleSafe(game.title, currency);
      if (!result.ok) gog = "unavailable";
      else if (result.value?.offer) {
        offers.push({
          ...result.value.offer,
          dealId: previousGog?.dealId ?? result.value.offer.dealId,
        });
        return withBest({
          ...game,
          genres: [...new Set([...game.genres, ...result.value.genres])],
          playModes: [...new Set([...game.playModes, ...result.value.playModes])],
          cover: game.steamAppId ? game.cover : result.value.cover || game.cover,
          offers,
          bestOffer: pickBest(offers),
        });
      }
    }

    return withBest({ ...game, offers, bestOffer: pickBest(offers) });
  });

  return { games: updated, steam, gog };
}
