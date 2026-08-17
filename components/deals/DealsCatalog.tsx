import { Suspense } from "react";
import { DealFilters } from "@/components/deals/DealFilters";
import { DealGrid } from "@/components/deals/DealGrid";
import { DealGridSkeleton } from "@/components/ui/Skeleton";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { queryDeals } from "@/lib/deals";
import { parseDealQuery } from "@/lib/deals/query";
import { getRequestCurrency } from "@/lib/currency-server";
import type { DealQuery, StoreFilter } from "@/lib/types";

export async function DealsCatalog({
  searchParams,
  defaults,
  title,
  subtitle,
  storeLocked,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  defaults?: Partial<DealQuery>;
  title: string;
  subtitle: string;
  storeLocked?: StoreFilter;
}) {
  const currency = await getRequestCurrency();
  const query = parseDealQuery(searchParams, {
    ...defaults,
    currency,
    store: storeLocked && storeLocked !== "both" ? storeLocked : defaults?.store,
    pageSize: 24,
  });
  const result = await queryDeals(query);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>
      <div className="mt-8">
        <Suspense>
          <DealFilters storeLocked={storeLocked === "steam" || storeLocked === "gog" ? storeLocked : undefined} />
        </Suspense>
      </div>
      <ErrorBanner sources={result.sources} notice={result.notice} />
      <p className="mb-5 text-sm text-muted">Prices below are the live amounts on Steam and GOG.</p>
      <DealGrid games={result.games} />
    </div>
  );
}

export function DealsCatalogFallback({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted">Loading live prices…</p>
      <div className="mt-10">
        <DealGridSkeleton count={8} />
      </div>
    </div>
  );
}
