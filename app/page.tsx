import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ComparePreview } from "@/components/home/ComparePreview";
import { AlertCta } from "@/components/home/AlertCta";
import { DealGrid } from "@/components/deals/DealGrid";
import { SectionHeader } from "@/components/deals/SectionHeader";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getHomeData } from "@/lib/deals/home";
import { getRequestCurrency } from "@/lib/currency-server";

export const revalidate = 300;

export default async function HomePage() {
  const currency = await getRequestCurrency();
  const data = await getHomeData(currency);

  return (
    <>
      <Hero />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ErrorBanner sources={data.sources} notice={data.notice} />
        <section className="py-6">
          <SectionHeader title="Today's Best Deals" href="/deals" eyebrow="Live right now" />
          <DealGrid games={data.best} />
        </section>
        <section className="py-10">
          <SectionHeader title="Biggest Price Drops" href="/drops?sort=discount" eyebrow="Deep cuts" />
          <DealGrid games={data.drops} />
        </section>
      </div>
      <ComparePreview game={data.featured} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section className="py-10">
          <SectionHeader title="🔥 Trending Deals" href="/deals?minRating=80" />
          <DealGrid games={data.trending} />
        </section>
        <section className="py-10">
          <SectionHeader title="💎 Hidden Gems" href="/browse?minDiscount=70" />
          <DealGrid games={data.gems} />
        </section>
        <section className="py-10">
          <SectionHeader title="🎯 Under $10" href="/deals?maxPrice=10&sort=price" />
          <DealGrid games={data.under10} />
        </section>
        <section className="py-10">
          <SectionHeader title="Recently Added Deals" href="/deals?sort=newest" />
          <DealGrid games={data.recent} />
        </section>
      </div>
      <HowItWorks />
      <AlertCta />
    </>
  );
}
