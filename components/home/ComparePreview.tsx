import Link from "next/link";
import { ComparisonTable } from "@/components/deals/ComparisonTable";
import { CoverImage } from "@/components/ui/CoverImage";
import type { GameDetails } from "@/lib/types";

export function ComparePreview({ game }: { game: GameDetails | null }) {
  if (!game) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-line bg-card">
        <div className="grid lg:grid-cols-[1.1fr_1.4fr]">
          <div className="relative min-h-64">
            <CoverImage
              src={game.background || game.cover}
              alt={game.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-card via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-deal">Compare Steam vs GOG</p>
              <h2 className="mt-2 text-3xl font-bold">{game.title}</h2>
            </div>
          </div>
          <div className="p-6">
            <ComparisonTable offers={game.offers} bestStore={game.bestOffer?.store} />
            <Link href={`/game/${game.gameId}`} className="mt-4 inline-block text-sm font-semibold text-muted hover:text-foreground">
              Open full comparison →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
