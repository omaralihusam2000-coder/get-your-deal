"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import type { CurrencyCode, FavoriteGame, LocalProfile, PriceAlert } from "@/lib/types";

type AppState = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  profile: LocalProfile | null;
  setProfile: (profile: LocalProfile | null) => void;
  favorites: FavoriteGame[];
  toggleFavorite: (game: FavoriteGame) => void;
  isFavorite: (gameId: string) => boolean;
  alerts: PriceAlert[];
  addAlert: (alert: PriceAlert) => void;
  removeAlert: (id: string) => void;
};

const AppContext = createContext<AppState | null>(null);

const KEYS = {
  profile: "dealforge:profile",
  favorites: "dealforge:favorites",
  alerts: "dealforge:alerts",
};

const EVENT = "dealforge-store";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(EVENT, onStoreChange);
  };
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

function snapshot(key: string) {
  return localStorage.getItem(key);
}

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function AppProviders({
  children,
  currency: initialCurrency,
}: {
  children: React.ReactNode;
  currency: CurrencyCode;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);
  const profileRaw = useSyncExternalStore(subscribe, () => snapshot(KEYS.profile), () => null);
  const favoritesRaw = useSyncExternalStore(subscribe, () => snapshot(KEYS.favorites), () => null);
  const alertsRaw = useSyncExternalStore(subscribe, () => snapshot(KEYS.alerts), () => null);

  const profile = parse<LocalProfile | null>(profileRaw, null);
  const favorites = parse<FavoriteGame[]>(favoritesRaw, []);
  const alerts = parse<PriceAlert[]>(alertsRaw, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    void fetch("/api/currency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: next }),
    }).then(() => {
      window.location.reload();
    });
  }, []);

  const setProfile = useCallback((next: LocalProfile | null) => {
    write(KEYS.profile, next);
  }, []);

  const toggleFavorite = useCallback((game: FavoriteGame) => {
    const current = parse<FavoriteGame[]>(snapshot(KEYS.favorites), []);
    const exists = current.some((item) => item.gameId === game.gameId);
    write(KEYS.favorites, exists ? current.filter((item) => item.gameId !== game.gameId) : [game, ...current]);
  }, []);

  const isFavorite = useCallback(
    (gameId: string) => favorites.some((item) => item.gameId === gameId),
    [favorites],
  );

  const addAlert = useCallback((alert: PriceAlert) => {
    const current = parse<PriceAlert[]>(snapshot(KEYS.alerts), []);
    write(KEYS.alerts, [alert, ...current.filter((item) => item.gameId !== alert.gameId)]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    const current = parse<PriceAlert[]>(snapshot(KEYS.alerts), []);
    write(KEYS.alerts, current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      profile,
      setProfile,
      favorites,
      toggleFavorite,
      isFavorite,
      alerts,
      addAlert,
      removeAlert,
    }),
    [currency, setCurrency, profile, setProfile, favorites, toggleFavorite, isFavorite, alerts, addAlert, removeAlert],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProviders");
  return ctx;
}
