import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,59,255,0.28),_transparent_42%)]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-deal">Steam + GOG · Live prices</p>
        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Stop Overpaying for Games.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-xl">
          Compare Steam and GOG prices and find the best PC game deals in seconds.
        </p>
        <div className="mx-auto mt-8 max-w-2xl">
          <SearchBar large />
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/search"
            className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-deal"
          >
            Search Deals
          </Link>
          <Link
            href="/deals"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold hover:bg-white/10"
          >
            Browse Deals
          </Link>
        </div>
      </div>
    </section>
  );
}
