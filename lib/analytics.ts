/**
 * Privacy-friendly analytics. Events stay on-device unless a backend
 * collector is configured later via ANALYTICS_ENDPOINT.
 */

export type AnalyticsEvent =
  | { name: "search"; query: string }
  | { name: "view_game"; gameId: string; title: string }
  | { name: "click_deal"; gameId: string; store: string }
  | { name: "set_alert"; gameId: string }
  | { name: "favorite"; gameId: string; on: boolean };

const STORAGE_KEY = "dealforge:analytics";

export function track(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  const payload = { ...event, at: new Date().toISOString() };
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown[];
    const next = [...existing, payload].slice(-200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private-mode failures.
  }
}
