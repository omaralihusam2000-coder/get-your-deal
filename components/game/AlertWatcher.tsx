"use client";

import { useEffect } from "react";
import { useApp } from "@/components/providers/AppProviders";
import type { DealGame } from "@/lib/types";

export function AlertWatcher() {
  const { alerts, currency } = useApp();

  useEffect(() => {
    if (!alerts.length || !("Notification" in window) || Notification.permission !== "granted") return;

    let cancelled = false;
    async function check() {
      for (const alert of alerts) {
        if (!alert.browser) continue;
        try {
          const response = await fetch(`/api/game/${alert.gameId}?currency=${currency}`);
          if (!response.ok) continue;
          const game = (await response.json()) as { bestOffer?: DealGame["bestOffer"]; title?: string };
          const amount = game.bestOffer?.currentPrice.amount;
          if (amount !== undefined && amount <= alert.targetPrice && !cancelled) {
            new Notification(`${game.title ?? alert.title} hit your target`, {
              body: `Now ${amount} ${currency} — target was ${alert.targetPrice}.`,
            });
          }
        } catch {
          // Ignore individual lookup failures.
        }
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [alerts, currency]);

  return null;
}
