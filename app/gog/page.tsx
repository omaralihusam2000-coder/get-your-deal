import { Suspense } from "react";
import { DealsCatalog, DealsCatalogFallback } from "@/components/deals/DealsCatalog";

export const revalidate = 300;

export default async function GogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<DealsCatalogFallback title="GOG Deals" />}>
      <DealsCatalog
        searchParams={params}
        storeLocked="gog"
        defaults={{ onSale: true, store: "gog" }}
        title="GOG Deals"
        subtitle="DRM-free GOG prices, compared only against GOG's live catalog."
      />
    </Suspense>
  );
}
