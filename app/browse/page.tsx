import { Suspense } from "react";
import { DealsCatalog, DealsCatalogFallback } from "@/components/deals/DealsCatalog";

export const revalidate = 300;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<DealsCatalogFallback title="Browse" />}>
      <DealsCatalog
        searchParams={params}
        defaults={{ sort: "rated", pageSize: 24 }}
        title="Browse"
        subtitle="Explore the catalog by genre, play mode, year, and rating. Only verified store prices are shown."
      />
    </Suspense>
  );
}
