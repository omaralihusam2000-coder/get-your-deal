export const CURRENCIES = ["USD", "EUR", "GBP"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const STORES = ["steam", "gog"] as const;
export type StoreSlug = (typeof STORES)[number];

export type StoreFilter = StoreSlug | "both";

export type DealSort =
  | "deal"
  | "price"
  | "discount"
  | "rated"
  | "newest"
  | "history";

export type PlayMode = "any" | "single" | "multi";

export type SourceStatus = "ok" | "unavailable" | "skipped";

export type Money = {
  amount: number;
  currency: CurrencyCode;
  /** Set when the displayed amount was converted from another currency. */
  convertedFrom?: CurrencyCode;
};

export type StoreOffer = {
  store: StoreSlug;
  storeName: string;
  dealId: string | null;
  storeGameId: string | null;
  currentPrice: Money;
  originalPrice: Money;
  discountPercent: number;
  url: string;
  available: boolean;
  lastChange: string | null;
};

export type DealGame = {
  gameId: string;
  title: string;
  steamAppId: string | null;
  thumb: string | null;
  cover: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  steamRatingText: string | null;
  steamRatingPercent: number | null;
  steamRatingCount: number | null;
  metacriticScore: number | null;
  dealRating: number | null;
  cheapestEver: Money | null;
  cheapestEverDate: string | null;
  offers: StoreOffer[];
  bestOffer: StoreOffer | null;
  genres: string[];
  playModes: Array<"single" | "multi">;
  isRecentlyReleased: boolean;
};

export type PricePoint = {
  date: string;
  price: Money;
  label: string;
};

export type PriceHistory = {
  available: boolean;
  current: Money | null;
  lowestRecorded: Money | null;
  lowestRecordedDate: string | null;
  points: PricePoint[];
  note: string | null;
};

export type GameDetails = {
  gameId: string;
  title: string;
  description: string | null;
  shortDescription: string | null;
  genres: string[];
  releaseDate: string | null;
  developers: string[];
  publishers: string[];
  screenshots: string[];
  background: string | null;
  cover: string | null;
  systemRequirements: {
    minimum: string | null;
    recommended: string | null;
  };
  steamUrl: string | null;
  gogUrl: string | null;
  userRating: {
    source: string;
    text: string | null;
    percent: number | null;
    count: number | null;
  } | null;
  offers: StoreOffer[];
  bestOffer: StoreOffer | null;
  history: PriceHistory;
  sources: {
    cheapshark: SourceStatus;
    steam: SourceStatus;
    gog: SourceStatus;
  };
};

export type DealQuery = {
  store?: StoreFilter;
  q?: string;
  genre?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  year?: number;
  minRating?: number;
  playMode?: PlayMode;
  recentlyReleased?: boolean;
  bestValue?: boolean;
  biggestDiscount?: boolean;
  sort?: DealSort;
  page?: number;
  pageSize?: number;
  onSale?: boolean;
  currency?: CurrencyCode;
};

export type DealListResult = {
  games: DealGame[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  currency: CurrencyCode;
  sources: {
    cheapshark: SourceStatus;
    steam: SourceStatus;
    gog: SourceStatus;
    fx: SourceStatus;
  };
  fetchedAt: string;
  notice: string | null;
};

export type SearchResult = {
  games: DealGame[];
  query: string;
  currency: CurrencyCode;
  sources: DealListResult["sources"];
  fetchedAt: string;
};

export type FxRates = {
  base: "USD";
  rates: Record<CurrencyCode, number>;
  fetchedAt: string;
};

export type LocalProfile = {
  name: string;
  email: string;
};

export type PriceAlert = {
  id: string;
  gameId: string;
  title: string;
  targetPrice: number;
  currency: CurrencyCode;
  email: boolean;
  browser: boolean;
  createdAt: string;
  cover?: string | null;
};

export type FavoriteGame = {
  gameId: string;
  title: string;
  cover: string | null;
  addedAt: string;
};
