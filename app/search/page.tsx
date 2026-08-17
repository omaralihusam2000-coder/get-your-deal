import { SearchBar } from "@/components/layout/SearchBar";
import { SearchResultCard } from "@/components/deals/SearchResultCard";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { searchGames } from "@/lib/deals";
import { getRequestCurrency } from "@/lib/currency-server";

export const revalidate = 120;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const currency = await getRequestCurrency();
  const result = q.trim().length >= 2 ? await searchGames(q.trim(), currency) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Search deals</h1>
      <p className="mt-2 text-muted">Try Cyberpunk 2077, Baldur&apos;s Gate 3, The Witcher 3, Red Dead Redemption 2, or Elden Ring.</p>
      <div className="mt-6 max-w-2xl">
        <SearchBar large defaultValue={q} />
      </div>
      <div className="mt-10">
        {!q.trim() && (
          <EmptyState
            title="Search for a game"
            body="We'll compare live Steam and GOG prices, original prices, discounts, and the cheapest store."
          />
        )}
        {result && (
          <>
            <ErrorBanner sources={result.sources} />
            <p className="mb-5 text-sm text-muted">
              {result.games.length} verified result{result.games.length === 1 ? "" : "s"} for “{result.query}”
            </p>
            {result.games.length === 0 ? (
              <EmptyState
                title="No verified matches"
                body="We couldn't find that title in the live Steam/GOG catalogs. Check the spelling or browse deals."
              />
            ) : (
              <div className="grid gap-4">
                {result.games.map((game) => (
                  <SearchResultCard key={game.gameId} game={game} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
