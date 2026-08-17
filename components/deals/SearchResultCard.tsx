import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CoverImage } from "@/components/ui/CoverImage";
import { StoreLogo } from "@/components/ui/StoreLogo";
import { formatDate, formatDiscount, formatMoney } from "@/lib/format";
import type { DealGame, Money } from "@/lib/types";

export function SearchResultCard({ game }: { game: DealGame }) {
  const steam = game.offers.find((offer) => offer.store === "steam");
  const gog = game.offers.find((offer) => offer.store === "gog");
  const best = game.bestOffer;
  const original = best?.originalPrice;
  const discount = Math.max(...game.offers.map((offer) => offer.discountPercent), 0);

  return (
    <article className="grid gap-4 rounded-3xl border border-line bg-card p-4 sm:grid-cols-[180px_1fr] sm:p-5">
      <Link href={`/game/${game.gameId}`} className="overflow-hidden rounded-2xl">
        <CoverImage
          src={game.cover}
          fallback={game.thumb}
          alt={game.title}
          className="h-40 w-full object-cover sm:h-full"
        />
      </Link>
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href={`/game/${game.gameId}`} className="text-2xl font-bold hover:underline">
              {game.title}
            </Link>
            <p className="mt-1 text-sm text-muted">
              {game.releaseDate ? `Released ${formatDate(game.releaseDate)}` : "Release date unavailable"}
              {game.genres.length ? ` · ${game.genres.slice(0, 3).join(", ")}` : ""}
            </p>
          </div>
          {discount > 0 && (
            <span className="rounded-full bg-deal px-3 py-1 text-sm font-bold text-black">{formatDiscount(discount)}</span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <Price label="Original" money={original} strike />
          <Price label="Steam" money={steam?.currentPrice} />
          <Price label="GOG" money={gog?.currentPrice} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          {best ? (
            <span className="inline-flex items-center gap-2 text-deal">
              <span className="h-2 w-2 rounded-full bg-deal" />
              <StoreLogo store={best.store} />
              <span className="font-bold">Cheapest store</span>
            </span>
          ) : (
            <span className="text-muted">No live Steam/GOG price yet</span>
          )}
          {game.steamRatingPercent && (
            <span className="text-muted">
              {game.steamRatingPercent}% {game.steamRatingText ?? "Steam rating"}
            </span>
          )}
          {game.cheapestEver && (
            <span className="text-muted">Lowest recorded: {formatMoney(game.cheapestEver)}</span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {best && (
            <a
              href={best.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-deal"
            >
              Get Deal <ArrowRight className="h-4 w-4" />
            </a>
          )}
          <Link href={`/game/${game.gameId}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold">
            Compare prices
          </Link>
        </div>
      </div>
    </article>
  );
}

function Price({
  label,
  money,
  strike,
}: {
  label: string;
  money?: Money | null;
  strike?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className={`text-xl font-bold ${strike ? "text-muted line-through" : ""}`}>
        {money ? formatMoney(money) : "—"}
      </p>
    </div>
  );
}
