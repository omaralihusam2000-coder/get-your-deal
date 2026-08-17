"use client";

import { Heart } from "lucide-react";
import { useApp } from "@/components/providers/AppProviders";
import { track } from "@/lib/analytics";

export function FavoriteButton({
  gameId,
  title,
  cover,
}: {
  gameId: string;
  title: string;
  cover: string | null;
}) {
  const { isFavorite, toggleFavorite } = useApp();
  const active = isFavorite(gameId);

  return (
    <button
      type="button"
      onClick={() => {
        toggleFavorite({ gameId, title, cover, addedAt: new Date().toISOString() });
        track({ name: "favorite", gameId, on: !active });
      }}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
        active ? "border-deal bg-deal/10 text-deal" : "border-white/10 bg-white/5"
      }`}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-deal" : ""}`} />
      {active ? "Favorited" : "Add to favorites"}
    </button>
  );
}
