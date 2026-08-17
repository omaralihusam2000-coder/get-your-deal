import { DealCard } from "@/components/deals/DealCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DealGame } from "@/lib/types";

export function DealGrid({ games }: { games: DealGame[] }) {
  if (!games.length) {
    return (
      <EmptyState
        title="No deals match these filters"
        body="Try a different store, price range, or clear filters. We only show live Steam and GOG prices."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {games.map((game) => (
        <DealCard key={game.gameId} game={game} />
      ))}
    </div>
  );
}
