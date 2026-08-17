import { Suspense } from "react";
import { DealsCatalog, DealsCatalogFallback } from "@/components/deals/DealsCatalog";

export const revalidate = 300;

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<DealsCatalogFallback title="All Deals" />}>
      <DealsCatalog
        searchParams={params}
        defaults={{ onSale: true }}
        title="All Deals"
        subtitle="Live Steam and GOG prices. Filter by store, discount, rating, and more."
      />
    </Suspense>
  );
}
