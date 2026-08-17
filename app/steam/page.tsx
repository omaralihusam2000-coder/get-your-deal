import { Suspense } from "react";
import { DealsCatalog, DealsCatalogFallback } from "@/components/deals/DealsCatalog";

export const revalidate = 300;

export default async function SteamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<DealsCatalogFallback title="Steam Deals" />}>
      <DealsCatalog
        searchParams={params}
        storeLocked="steam"
        defaults={{ onSale: true, store: "steam" }}
        title="Steam Deals"
        subtitle="Official Steam storefront prices only. Open a deal to go straight to Steam."
      />
    </Suspense>
  );
}
