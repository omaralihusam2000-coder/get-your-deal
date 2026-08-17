import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CoverImage } from "@/components/ui/CoverImage";
import { StoreLogo } from "@/components/ui/StoreLogo";
import { formatDiscount, formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { DealGame } from "@/lib/types";

export function DealCard({ game }: { game: DealGame }) {
  const best = game.bestOffer;
  const discount = best ? Math.round(best.discountPercent) : 0;
  const original = best && best.originalPrice.amount > best.currentPrice.amount ? best.originalPrice : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-card shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-card">
      <Link href={`/game/${game.gameId}`} className="block overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
          <CoverImage
            src={game.cover}
            fallback={game.thumb}
            alt={game.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="badge-live absolute left-3 top-3 rounded-full bg-deal px-2.5 py-1 text-sm font-bold text-black">
              {formatDiscount(discount)}
            </span>
          )}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 min-h-12 text-lg font-semibold leading-tight">{game.title}</h3>
        <div className="flex items-end gap-2">
          {original && (
            <span className="text-sm text-muted line-through">{formatMoney(original)}</span>
          )}
          <span className="text-2xl font-bold tracking-tight">
            {best ? formatMoney(best.currentPrice) : "Unavailable"}
          </span>
        </div>
        {best && (
          <div className="flex items-center gap-2 text-deal">
            <span className="h-2 w-2 rounded-full bg-deal" />
            <StoreLogo store={best.store} />
            <span className="text-xs font-bold">BEST PRICE</span>
          </div>
        )}
        <Link
          href={best?.url || `/game/${game.gameId}`}
          target={best?.url ? "_blank" : undefined}
          rel={best?.url ? "noreferrer" : undefined}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-deal",
          )}
        >
          {best ? "View Deal" : "Compare"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
