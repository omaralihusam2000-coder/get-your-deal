import "server-only";

import { CHEAPSHARK_SORT, GOG_STORE_ID, RECENT_RELEASE_MS, STEAM_STORE_ID } from "../constants";
import { discountPercent, normalizeTitle, unixToIso, yearFromIso } from "../format";
import { settled } from "../http";
import type {
  CurrencyCode,
  DealGame,
  DealListResult,
  DealQuery,
  GameDetails,
  PriceHistory,
  SearchResult,
  SourceStatus,
  StoreFilter,
  StoreOffer,
} from "../types";
import {
  fetchCheapSharkDeals,
  lookupCheapSharkGame,
  lookupCheapSharkGames,
  offerFromCheapSharkDeal,
  offerFromLookupDeal,
  searchCheapSharkGames,
  steamArtwork,
  type CheapSharkDeal,
  type CheapSharkGameLookup,
} from "../providers/cheapshark";
import { convertMoney, getUsdRates } from "../providers/fx";
import { fetchGogByTitleSafe, searchGogCatalog } from "../providers/gog";
import { fetchSteamAppSafe } from "../providers/steam";

function emptySources(): DealListResult["sources"] {
  return { cheapshark: "ok", steam: "skipped", gog: "skipped", fx: "skipped" };
}

function pickBest(offers: StoreOffer[]): StoreOffer | null {
  const available = offers.filter((offer) => offer.available);
  if (!available.length) return null;
  return available.reduce((best, offer) =>
    offer.currentPrice.amount < best.currentPrice.amount ? offer : best,
  );
}

function applyCurrency(offer: StoreOffer, currency: CurrencyCode, rates: Awaited<ReturnType<typeof getUsdRates>> | null) {
  if (offer.currentPrice.currency === currency) return offer;
  if (!rates) return offer;
  return {
    ...offer,
    currentPrice: convertMoney(offer.currentPrice, currency, rates),
    originalPrice: convertMoney(offer.originalPrice, currency, rates),
  };
}

function fromCheapSharkDeal(deal: CheapSharkDeal): DealGame {
  const releaseIso = unixToIso(deal.releaseDate);
  const offer = offerFromCheapSharkDeal(deal);
  const offers = offer ? [offer] : [];
  const rating = Number.parseInt(deal.steamRatingPercent, 10);
  const count = Number.parseInt(deal.steamRatingCount, 10);
  const metacritic = Number.parseInt(deal.metacriticScore, 10);
  const dealRating = Number.parseFloat(deal.dealRating);

  return {
    gameId: deal.gameID,
    title: deal.title,
    steamAppId: deal.steamAppID,
    thumb: deal.thumb,
    cover: steamArtwork(deal.steamAppID, "capsule") ?? deal.thumb,
    releaseDate: releaseIso,
    releaseYear: yearFromIso(releaseIso),
    steamRatingText: deal.steamRatingText,
    steamRatingPercent: Number.isFinite(rating) && rating > 0 ? rating : null,
    steamRatingCount: Number.isFinite(count) && count > 0 ? count : null,
    metacriticScore: Number.isFinite(metacritic) && metacritic > 0 ? metacritic : null,
    dealRating: Number.isFinite(dealRating) ? dealRating : null,
    cheapestEver: null,
    cheapestEverDate: null,
    offers,
    bestOffer: pickBest(offers),
    genres: [],
    playModes: [],
    isRecentlyReleased: releaseIso
      ? Date.now() - new Date(releaseIso).getTime() < RECENT_RELEASE_MS
      : false,
  };
}

function mergeGames(games: DealGame[]): DealGame[] {
  const map = new Map<string, DealGame>();
  for (const game of games) {
    const existing = map.get(game.gameId);
    if (!existing) {
      map.set(game.gameId, game);
      continue;
    }
    const offers = [...existing.offers];
    for (const offer of game.offers) {
      const index = offers.findIndex((item) => item.store === offer.store);
      if (index === -1) offers.push(offer);
      else if (offer.currentPrice.amount < offers[index].currentPrice.amount) offers[index] = offer;
    }
    map.set(game.gameId, {
      ...existing,
      ...game,
      title: existing.title || game.title,
      steamAppId: existing.steamAppId || game.steamAppId,
      cover: existing.cover || game.cover,
      thumb: existing.thumb || game.thumb,
      steamRatingPercent: existing.steamRatingPercent ?? game.steamRatingPercent,
      steamRatingText: existing.steamRatingText ?? game.steamRatingText,
      steamRatingCount: existing.steamRatingCount ?? game.steamRatingCount,
      metacriticScore: existing.metacriticScore ?? game.metacriticScore,
      dealRating: Math.max(existing.dealRating ?? 0, game.dealRating ?? 0) || existing.dealRating,
      cheapestEver: existing.cheapestEver ?? game.cheapestEver,
      cheapestEverDate: existing.cheapestEverDate ?? game.cheapestEverDate,
      genres: [...new Set([...existing.genres, ...game.genres])],
      playModes: [...new Set([...existing.playModes, ...game.playModes])],
      offers,
      bestOffer: pickBest(offers),
    });
  }
  return [...map.values()];
}

function hydrateFromLookup(game: DealGame, lookup: CheapSharkGameLookup | undefined): DealGame {
  if (!lookup) return game;
  const steamAppId = game.steamAppId || lookup.info.steamAppID;
  const lookupOffers = lookup.deals
    .map((deal) => offerFromLookupDeal(deal, steamAppId))
    .filter((offer): offer is StoreOffer => Boolean(offer));
  const merged = mergeGames([
    game,
    {
      ...game,
      steamAppId,
      title: lookup.info.title || game.title,
      thumb: lookup.info.thumb || game.thumb,
      cover: steamArtwork(steamAppId, "capsule") ?? lookup.info.thumb ?? game.cover,
      cheapestEver: lookup.cheapestPriceEver
        ? { amount: Number.parseFloat(lookup.cheapestPriceEver.price), currency: "USD" }
        : game.cheapestEver,
      cheapestEverDate: lookup.cheapestPriceEver
        ? unixToIso(lookup.cheapestPriceEver.date)
        : game.cheapestEverDate,
      offers: lookupOffers,
      bestOffer: pickBest(lookupOffers),
    },
  ])[0];
  return merged;
}

function convertGame(game: DealGame, currency: CurrencyCode, rates: Awaited<ReturnType<typeof getUsdRates>> | null): DealGame {
  if (currency === "USD" || !rates) return game;
  const offers = game.offers.map((offer) => applyCurrency(offer, currency, rates));
  return {
    ...game,
    cheapestEver: game.cheapestEver ? convertMoney(game.cheapestEver, currency, rates) : null,
    offers,
    bestOffer: pickBest(offers),
  };
}

function storeIds(store: StoreFilter | undefined) {
  if (store === "steam") return STEAM_STORE_ID;
  if (store === "gog") return GOG_STORE_ID;
  return `${STEAM_STORE_ID},${GOG_STORE_ID}`;
}

function filterGames(games: DealGame[], query: DealQuery): DealGame[] {
  return games.filter((game) => {
    if (query.store && query.store !== "both") {
      if (!game.offers.some((offer) => offer.store === query.store)) return false;
    }
    if (query.minPrice !== undefined) {
      if (!game.bestOffer || game.bestOffer.currentPrice.amount < query.minPrice) return false;
    }
    if (query.maxPrice !== undefined) {
      if (!game.bestOffer || game.bestOffer.currentPrice.amount > query.maxPrice) return false;
    }
    if (query.minDiscount !== undefined && query.minDiscount > 0) {
      const discount = Math.max(...game.offers.map((offer) => offer.discountPercent), 0);
      if (discount < query.minDiscount) return false;
    }
    if (query.year) {
      if (game.releaseYear !== query.year) return false;
    }
    if (query.minRating) {
      if ((game.steamRatingPercent ?? 0) < query.minRating) return false;
    }
    if (query.recentlyReleased && !game.isRecentlyReleased) return false;
    if (query.genre) {
      const wanted = query.genre.toLowerCase();
      if (!game.genres.some((genre) => genre.toLowerCase() === wanted)) return false;
    }
    if (query.playMode && query.playMode !== "any") {
      if (!game.playModes.includes(query.playMode)) return false;
    }
    if (query.q) {
      if (!normalizeTitle(game.title).includes(normalizeTitle(query.q))) return false;
    }
    return true;
  });
}

function sortGames(games: DealGame[], sort: DealQuery["sort"]): DealGame[] {
  const copy = [...games];
  copy.sort((a, b) => {
    switch (sort) {
      case "price":
        return (a.bestOffer?.currentPrice.amount ?? 9999) - (b.bestOffer?.currentPrice.amount ?? 9999);
      case "discount":
        return (
          Math.max(...b.offers.map((offer) => offer.discountPercent), 0) -
          Math.max(...a.offers.map((offer) => offer.discountPercent), 0)
        );
      case "rated":
        return (b.steamRatingPercent ?? 0) - (a.steamRatingPercent ?? 0);
      case "newest":
        return (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
      case "history": {
        const dist = (game: DealGame) => {
          if (!game.bestOffer || !game.cheapestEver) return Number.POSITIVE_INFINITY;
          return game.bestOffer.currentPrice.amount - game.cheapestEver.amount;
        };
        return dist(a) - dist(b);
      }
      case "deal":
      default:
        return (b.dealRating ?? 0) - (a.dealRating ?? 0);
    }
  });
  return copy;
}

async function attachLookups(games: DealGame[]): Promise<DealGame[]> {
  const ids = games.map((game) => game.gameId).filter(Boolean);
  const lookup = await settled(lookupCheapSharkGames(ids));
  if (!lookup.ok) return games;
  return games.map((game) => hydrateFromLookup(game, lookup.value[game.gameId]));
}

async function attachGogNative(games: DealGame[], currency: CurrencyCode, enabled: boolean) {
  if (!enabled) return { games, status: "skipped" as SourceStatus };
  const top = games.slice(0, 12);
  const results = await Promise.all(
    top.map(async (game) => {
      const gog = await fetchGogByTitleSafe(game.title, currency);
      return { game, gog };
    }),
  );
  let status: SourceStatus = "ok";
  const rest = games.slice(12);
  const updated = results.map(({ game, gog }) => {
    if (!gog.ok) {
      status = "unavailable";
      return game;
    }
    if (!gog.value) return game;
    const native = gog.value.offer;
    const offers = game.offers.filter((offer) => offer.store !== "gog");
    if (native) {
      offers.push({
        ...native,
        dealId: game.offers.find((offer) => offer.store === "gog")?.dealId ?? native.dealId,
        url: native.url,
      });
    }
    return {
      ...game,
      genres: [...new Set([...game.genres, ...gog.value.genres])],
      playModes: [...new Set([...game.playModes, ...gog.value.playModes])],
      cover: game.steamAppId ? game.cover : gog.value.cover || game.cover,
      offers,
      bestOffer: pickBest(offers),
    };
  });
  return { games: [...updated, ...rest], status };
}

async function attachSteamNative(games: DealGame[], currency: CurrencyCode, enabled: boolean) {
  if (!enabled) return { games, status: "skipped" as SourceStatus };
  const top = games.slice(0, 8);
  const results = await Promise.all(
    top.map(async (game) => ({
      game,
      steam: await fetchSteamAppSafe(game.steamAppId, currency),
    })),
  );
  let status: SourceStatus = "ok";
  const rest = games.slice(8);
  const updated = results.map(({ game, steam }) => {
    if (!steam.ok) {
      if (steam.error !== "missing") status = "unavailable";
      return game;
    }
    if (!steam.value) return game;
    const native = steam.value.offer;
    const offers = game.offers.filter((offer) => offer.store !== "steam");
    if (native) {
      offers.push({
        ...native,
        dealId: game.offers.find((offer) => offer.store === "steam")?.dealId ?? native.dealId,
      });
    }
    return {
      ...game,
      genres: [...new Set([...game.genres, ...steam.value.genres])],
      playModes: [...new Set([...game.playModes, ...steam.value.playModes])],
      cover: steam.value.header || game.cover,
      offers,
      bestOffer: pickBest(offers),
    };
  });
  return { games: [...updated, ...rest], status };
}

export async function queryDeals(query: DealQuery = {}): Promise<DealListResult> {
  const currency = query.currency ?? "USD";
  const page = query.page ?? 0;
  const pageSize = Math.min(query.pageSize ?? 20, 60);
  const sources = emptySources();
  const sort = query.biggestDiscount ? "discount" : query.bestValue ? "deal" : query.sort ?? "deal";
  const onSale = query.onSale ?? (query.biggestDiscount || query.bestValue || sort === "discount");

  const fx = await settled(getUsdRates());
  sources.fx = fx.ok ? "ok" : "unavailable";
  const rates = fx.ok ? fx.value : null;

  const cheapshark = await settled(
    fetchCheapSharkDeals({
      storeIDs: storeIds(query.store),
      title: query.q,
      upperPrice: currency === "USD" ? query.maxPrice : undefined,
      lowerPrice: currency === "USD" ? query.minPrice : undefined,
      onSale: onSale || (query.minDiscount ?? 0) > 0,
      sortBy: CHEAPSHARK_SORT[sort],
      pageNumber: page,
      pageSize,
      steamRating: query.minRating,
    }),
  );

  if (!cheapshark.ok) {
    sources.cheapshark = "unavailable";
    return {
      games: [],
      page,
      pageSize,
      hasMore: false,
      currency,
      sources,
      fetchedAt: new Date().toISOString(),
      notice: "Deal listings are unavailable right now. Price comparison data could not be loaded.",
    };
  }

  let games = mergeGames(cheapshark.value.map(fromCheapSharkDeal));

  if (sort === "history" || query.genre || query.playMode) {
    const withLookups = await settled(attachLookups(games));
    if (withLookups.ok) games = withLookups.value;
  }

  if (query.genre && (query.store === "gog" || query.store === "both" || !query.store)) {
    const gogCatalog = await settled(
      searchGogCatalog(query.q || query.genre, currency, {
        genre: query.genre,
        limit: "48",
        order: "desc:trending",
      }),
    );
    if (gogCatalog.ok) {
      sources.gog = "ok";
      const wanted = query.genre.toLowerCase();
      const gogGames: DealGame[] = gogCatalog.value
        .filter((product) =>
          (product.genres ?? []).some((genre) => genre.name.toLowerCase() === wanted || genre.slug === wanted),
        )
        .map((product) => {
          const existing = games.find((game) => normalizeTitle(game.title) === normalizeTitle(product.title));
          if (existing) {
            return {
              ...existing,
              genres: [...new Set([...existing.genres, ...(product.genres ?? []).map((genre) => genre.name)])],
            };
          }
          return existing;
        })
        .filter((game): game is DealGame => Boolean(game));

      const matchedTitles = new Set(gogGames.map((game) => normalizeTitle(game.title)));
      const cheapMatched = games.filter(
        (game) =>
          game.genres.some((genre) => genre.toLowerCase() === wanted) ||
          matchedTitles.has(normalizeTitle(game.title)),
      );
      games = mergeGames([...cheapMatched, ...gogGames]);
    } else {
      sources.gog = "unavailable";
    }
  }

  const native = currency !== "USD";
  if (native) {
    const steam = await attachSteamNative(games, currency, query.store !== "gog");
    games = steam.games;
    sources.steam = steam.status;
    const gog = await attachGogNative(games, currency, query.store !== "steam");
    games = gog.games;
    if (sources.gog === "skipped") sources.gog = gog.status;
  }
  games = games.map((game) => convertGame(game, currency, rates));

  games = sortGames(filterGames(games, { ...query, sort }), sort);

  const noticeParts: string[] = [];
  if (currency !== "USD" && sources.steam !== "ok" && sources.gog !== "ok") {
    if (rates) {
      noticeParts.push(
        `${currency} amounts on this list are converted from USD using ECB rates and may differ from live storefront prices.`,
      );
    }
  }
  if (query.genre && games.length === 0) {
    noticeParts.push("Genre filters use available store metadata. Try another genre or clear the filter.");
  }

  return {
    games,
    page,
    pageSize,
    hasMore: cheapshark.value.length >= pageSize,
    currency,
    sources,
    fetchedAt: new Date().toISOString(),
    notice: noticeParts.join(" ") || null,
  };
}

export async function searchGames(q: string, currency: CurrencyCode = "USD"): Promise<SearchResult> {
  const sources = emptySources();
  const fx = await settled(getUsdRates());
  sources.fx = fx.ok ? "ok" : "unavailable";
  const rates = fx.ok ? fx.value : null;

  const search = await settled(searchCheapSharkGames(q, 12));
  if (!search.ok) {
    sources.cheapshark = "unavailable";
    return { games: [], query: q, currency, sources, fetchedAt: new Date().toISOString() };
  }

  const lookups = await settled(lookupCheapSharkGames(search.value.map((game) => game.gameID)));
  const games = search.value.map((hit) => {
    const lookup = lookups.ok ? lookups.value[hit.gameID] : undefined;
    const base: DealGame = {
      gameId: hit.gameID,
      title: hit.external,
      steamAppId: hit.steamAppID,
      thumb: hit.thumb,
      cover: steamArtwork(hit.steamAppID, "capsule") ?? hit.thumb,
      releaseDate: null,
      releaseYear: null,
      steamRatingText: null,
      steamRatingPercent: null,
      steamRatingCount: null,
      metacriticScore: null,
      dealRating: null,
      cheapestEver: { amount: Number.parseFloat(hit.cheapest), currency: "USD" },
      cheapestEverDate: null,
      offers: [],
      bestOffer: null,
      genres: [],
      playModes: [],
      isRecentlyReleased: false,
    };
    return convertGame(hydrateFromLookup(base, lookup), currency, rates);
  });

  return {
    games,
    query: q,
    currency,
    sources,
    fetchedAt: new Date().toISOString(),
  };
}

function historyFromGame(game: DealGame, best: StoreOffer | null): PriceHistory {
  const lowest = game.cheapestEver;
  const current = best?.currentPrice ?? null;
  const points = [];
  if (lowest && game.cheapestEverDate) {
    points.push({
      date: game.cheapestEverDate,
      price: lowest,
      label: "Lowest recorded",
    });
  }
  if (current) {
    points.push({
      date: new Date().toISOString(),
      price: current,
      label: "Current",
    });
  }

  if (points.length < 2) {
    return {
      available: false,
      current,
      lowestRecorded: lowest,
      lowestRecordedDate: game.cheapestEverDate,
      points: [],
      note: "Price history unavailable",
    };
  }

  return {
    available: true,
    current,
    lowestRecorded: lowest,
    lowestRecordedDate: game.cheapestEverDate,
    points,
    note: "Only verified recorded points are shown. A complete sale-period history is not published by Steam or GOG.",
  };
}

export async function getGameDetails(id: string, currency: CurrencyCode = "USD"): Promise<GameDetails | null> {
  const sources: GameDetails["sources"] = {
    cheapshark: "ok",
    steam: "skipped",
    gog: "skipped",
  };

  const lookup = await settled(lookupCheapSharkGame(id));
  if (!lookup.ok || !lookup.value) {
    sources.cheapshark = "unavailable";
    return null;
  }

  const fx = await settled(getUsdRates());
  const rates = fx.ok ? fx.value : null;
  const info = lookup.value;
  let game = hydrateFromLookup(
    {
      gameId: id,
      title: info.info.title,
      steamAppId: info.info.steamAppID,
      thumb: info.info.thumb,
      cover: steamArtwork(info.info.steamAppID, "header") ?? info.info.thumb,
      releaseDate: null,
      releaseYear: null,
      steamRatingText: null,
      steamRatingPercent: null,
      steamRatingCount: null,
      metacriticScore: null,
      dealRating: null,
      cheapestEver: null,
      cheapestEverDate: null,
      offers: [],
      bestOffer: null,
      genres: [],
      playModes: [],
      isRecentlyReleased: false,
    },
    info,
  );

  const steam = await fetchSteamAppSafe(game.steamAppId, currency);
  const gog = await fetchGogByTitleSafe(game.title, currency);

  if (steam.ok && steam.value) {
    sources.steam = "ok";
    const native = steam.value.offer;
    const offers = game.offers.filter((offer) => offer.store !== "steam");
    if (native) offers.push(native);
    else if (currency !== "USD") {
      game.offers
        .filter((offer) => offer.store === "steam")
        .forEach((offer) => offers.push(applyCurrency(offer, currency, rates)));
    }
    game = {
      ...game,
      title: steam.value.name || game.title,
      cover: steam.value.header || game.cover,
      genres: steam.value.genres,
      playModes: steam.value.playModes,
      releaseDate: steam.value.releaseDate || game.releaseDate,
      offers,
      bestOffer: pickBest(offers),
    };
  } else if (game.steamAppId) {
    sources.steam = steam.ok ? "skipped" : "unavailable";
  }

  if (gog.ok && gog.value) {
    sources.gog = "ok";
    const native = gog.value.offer;
    const offers = game.offers.filter((offer) => offer.store !== "gog");
    if (native) offers.push(native);
    else if (currency !== "USD") {
      game.offers
        .filter((offer) => offer.store === "gog")
        .forEach((offer) => offers.push(applyCurrency(offer, currency, rates)));
    }
    game = {
      ...game,
      genres: [...new Set([...game.genres, ...gog.value.genres])],
      playModes: [...new Set([...game.playModes, ...gog.value.playModes])],
      cover: game.cover || gog.value.cover,
      offers,
      bestOffer: pickBest(offers),
    };
  } else {
    sources.gog = gog.ok ? "skipped" : "unavailable";
  }

  if (currency !== "USD") {
    game = {
      ...game,
      cheapestEver: game.cheapestEver && rates ? convertMoney(game.cheapestEver, currency, rates) : game.cheapestEver,
      offers: game.offers.map((offer) =>
        offer.currentPrice.currency === currency ? offer : applyCurrency(offer, currency, rates),
      ),
    };
    game.bestOffer = pickBest(game.offers);
  }

  const steamDetails = steam.ok ? steam.value : null;
  const gogDetails = gog.ok ? gog.value : null;
  const best = pickBest(game.offers);

  return {
    gameId: id,
    title: game.title,
    description: steamDetails?.description ?? gogDetails?.description ?? null,
    shortDescription: steamDetails?.shortDescription ?? gogDetails?.shortDescription ?? null,
    genres: game.genres,
    releaseDate: steamDetails?.releaseDate ?? gogDetails?.releaseDate ?? game.releaseDate,
    developers: steamDetails?.developers?.length ? steamDetails.developers : gogDetails?.developers ?? [],
    publishers: steamDetails?.publishers?.length ? steamDetails.publishers : gogDetails?.publishers ?? [],
    screenshots: (steamDetails?.screenshots?.length ? steamDetails.screenshots : gogDetails?.screenshots ?? []).slice(0, 8),
    background: steamDetails?.background ?? steamArtwork(game.steamAppId, "hero"),
    cover: game.cover,
    systemRequirements: steamDetails?.systemRequirements ?? { minimum: null, recommended: null },
    steamUrl: game.offers.find((offer) => offer.store === "steam")?.url ?? null,
    gogUrl: gogDetails?.url ?? game.offers.find((offer) => offer.store === "gog")?.url ?? null,
    userRating:
      steamDetails?.userRating?.percent || game.steamRatingPercent
        ? {
            source: "Steam user reviews",
            text: steamDetails?.userRating?.text ?? game.steamRatingText,
            percent: steamDetails?.userRating?.percent ?? game.steamRatingPercent,
            count: steamDetails?.userRating?.count ?? game.steamRatingCount,
          }
        : null,
    offers: game.offers,
    bestOffer: best,
    history: historyFromGame(game, best),
    sources,
  };
}

export async function featuredComparison(currency: CurrencyCode = "USD") {
  const search = await searchGames("Cyberpunk 2077", currency);
  const match = search.games.find((game) => normalizeTitle(game.title) === "cyberpunk 2077") ?? search.games[0];
  if (!match) return null;
  return getGameDetails(match.gameId, currency);
}

export { discountPercent };
