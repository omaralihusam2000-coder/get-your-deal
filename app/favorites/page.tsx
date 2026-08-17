"use client";

import Link from "next/link";
import { DealCard } from "@/components/deals/DealCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApp } from "@/components/providers/AppProviders";
import { formatMoney } from "@/lib/format";

export default function FavoritesPage() {
  const { favorites, alerts, removeAlert, currency } = useApp();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Favorites</h1>
      <p className="mt-2 text-muted">Saved on this device. Sign in to attach an email for price alerts.</p>

      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-semibold">Watchlist</h2>
        {favorites.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            body="Open any game and tap Add to favorites. Your list stays on this browser until you sign in on another device."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {favorites.map((game) => (
              <DealCard
                key={game.gameId}
                game={{
                  gameId: game.gameId,
                  title: game.title,
                  steamAppId: null,
                  thumb: game.cover,
                  cover: game.cover,
                  releaseDate: null,
                  releaseYear: null,
                  steamRatingText: null,
                  steamRatingPercent: null,
                  steamRatingCount: null,
                  metacriticScore: null,
                  dealRating: null,
                  cheapestEver: null,
                  cheapestEverDate: null,
                  offers: [],
                  bestOffer: null,
                  genres: [],
                  playModes: [],
                  isRecentlyReleased: false,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="mb-5 text-2xl font-semibold">Price alerts</h2>
        {alerts.length === 0 ? (
          <EmptyState title="No alerts" body="Set a target price from any game page. Email alerts use CheapShark; browser alerts check prices when you open DealForge." />
        ) : (
          <div className="grid gap-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-4">
                <div>
                  <Link href={`/game/${alert.gameId}`} className="font-semibold hover:underline">
                    {alert.title}
                  </Link>
                  <p className="text-sm text-muted">
                    Below {formatMoney({ amount: alert.targetPrice, currency: alert.currency || currency })} ·{" "}
                    {[alert.email && "Email", alert.browser && "Browser"].filter(Boolean).join(" + ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAlert(alert.id)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-muted hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
