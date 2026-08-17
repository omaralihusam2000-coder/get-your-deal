"use client";

import { FormEvent, useState } from "react";
import { useApp } from "@/components/providers/AppProviders";
import { track } from "@/lib/analytics";

export function PriceAlertForm({
  gameId,
  title,
  cover,
  currentPrice,
}: {
  gameId: string;
  title: string;
  cover: string | null;
  currentPrice: number | null;
}) {
  const { profile, addAlert, currency } = useApp();
  const [email, setEmail] = useState(profile?.email ?? "");
  const [price, setPrice] = useState(currentPrice ? Math.max(1, Math.floor(currentPrice * 0.7)) : 20);
  const [browser, setBrowser] = useState(true);
  const [emailOn, setEmailOn] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);

    addAlert({
      id: crypto.randomUUID(),
      gameId,
      title,
      targetPrice: price,
      currency,
      email: emailOn,
      browser,
      createdAt: new Date().toISOString(),
      cover,
    });

    if (browser && "Notification" in window) {
      if (Notification.permission === "default") await Notification.requestPermission();
      if (Notification.permission === "granted") {
        new Notification(`DealForge alert saved`, {
          body: `We'll remind you on this device if ${title} is at or below your target.`,
        });
      }
    }

    if (emailOn && email.includes("@")) {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set", email, gameId, price }),
      });
      const json = (await response.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        setError(json.error || "Email alert could not be created.");
        setPending(false);
        return;
      }
    }

    track({ name: "set_alert", gameId });
    setMessage(`Notify me when ${title} drops below ${price}. Saved.`);
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-card p-5">
      <h3 className="text-lg font-semibold">Price alert</h3>
      <p className="mt-1 text-sm text-muted">Notify me when {title} drops below a target price.</p>
      <label className="mt-4 grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
        Target price ({currency})
        <input
          type="number"
          min={1}
          step="0.01"
          required
          value={price}
          onChange={(event) => setPrice(Number(event.target.value))}
          className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-foreground"
        />
      </label>
      <label className="mt-3 grid gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
          className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
        />
      </label>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={emailOn} onChange={(event) => setEmailOn(event.target.checked)} />
        Email notifications
      </label>
      <label className="mt-2 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={browser} onChange={(event) => setBrowser(event.target.checked)} />
        Browser notifications
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-xl bg-deal py-3 text-sm font-bold text-black disabled:opacity-60"
      >
        {pending ? "Saving…" : "Create alert"}
      </button>
      {message && <p className="mt-3 text-sm text-deal">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
    </form>
  );
}
