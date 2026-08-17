import { Suspense } from "react";
import { DealsCatalog, DealsCatalogFallback } from "@/components/deals/DealsCatalog";

export const revalidate = 300;

export default async function DropsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<DealsCatalogFallback title="Price Drops" />}>
      <DealsCatalog
        searchParams={params}
        defaults={{ sort: "discount", onSale: true, minDiscount: 40 }}
        title="Price Drops"
        subtitle="The steepest live discounts on Steam and GOG. We never label a price the best ever unless history proves it."
      />
    </Suspense>
  );
}
