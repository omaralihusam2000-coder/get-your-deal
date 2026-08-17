import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ComparePreview } from "@/components/home/ComparePreview";
import { AlertCta } from "@/components/home/AlertCta";
import { DealGrid } from "@/components/deals/DealGrid";
import { SectionHeader } from "@/components/deals/SectionHeader";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { featuredComparison, queryDeals } from "@/lib/deals";
import { getRequestCurrency } from "@/lib/currency-server";

export const revalidate = 300;

export default async function HomePage() {
  const currency = await getRequestCurrency();
  const [best, drops, recent, trending, under10, gems, featured] = await Promise.all([
    queryDeals({ sort: "deal", onSale: true, pageSize: 4, currency }),
    queryDeals({ sort: "discount", onSale: true, pageSize: 4, currency, minDiscount: 50 }),
    queryDeals({ sort: "newest", onSale: true, pageSize: 4, currency }),
    queryDeals({ sort: "deal", onSale: true, minRating: 80, pageSize: 4, currency }),
    queryDeals({ sort: "price", maxPrice: 10, onSale: true, pageSize: 4, currency }),
    queryDeals({ sort: "discount", onSale: true, minDiscount: 70, pageSize: 4, currency }),
    featuredComparison(currency),
  ]);

  return (
    <>
      <Hero />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ErrorBanner
          sources={best.sources}
          notice={best.notice}
        />
        <section className="py-6">
          <SectionHeader title="Today's Best Deals" href="/deals" eyebrow="Live right now" />
          <DealGrid games={best.games} />
        </section>
        <section className="py-10">
          <SectionHeader title="Biggest Price Drops" href="/drops?sort=discount" eyebrow="Deep cuts" />
          <DealGrid games={drops.games} />
        </section>
      </div>
      <ComparePreview game={featured} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section className="py-10">
          <SectionHeader title="🔥 Trending Deals" href="/deals?minRating=80" />
          <DealGrid games={trending.games} />
        </section>
        <section className="py-10">
          <SectionHeader title="💎 Hidden Gems" href="/browse?minDiscount=70" />
          <DealGrid games={gems.games} />
        </section>
        <section className="py-10">
          <SectionHeader title="🎯 Under $10" href="/deals?maxPrice=10&sort=price" />
          <DealGrid games={under10.games} />
        </section>
        <section className="py-10">
          <SectionHeader title="Recently Added Deals" href="/deals?sort=newest" />
          <DealGrid games={recent.games} />
        </section>
      </div>
      <HowItWorks />
      <AlertCta />
    </>
  );
}
