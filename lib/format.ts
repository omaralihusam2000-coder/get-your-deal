import type { CurrencyCode, Money } from "./types";

const FORMATTERS: Record<CurrencyCode, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
  EUR: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }),
  GBP: new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }),
};

export function formatMoney(money: Money | null | undefined): string {
  if (!money || !Number.isFinite(money.amount)) return "—";
  return FORMATTERS[money.currency].format(money.amount);
}

export function formatDiscount(percent: number | null | undefined): string {
  if (!percent || percent <= 0) return "";
  return `-${Math.round(percent)}%`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Unknown";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function unixToIso(unix: number | string | null | undefined): string | null {
  const value = typeof unix === "string" ? Number(unix) : unix;
  if (!value || !Number.isFinite(value) || value <= 0) return null;
  return new Date(value * 1000).toISOString();
}

export function parsePrice(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(amount)) return null;
  return amount;
}

export function discountPercent(current: number, original: number): number {
  if (!original || original <= 0 || current >= original) return 0;
  return ((original - current) / original) * 100;
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/™|®|©/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function yearFromIso(iso: string | null): number | null {
  if (!iso) return null;
  const year = new Date(iso).getFullYear();
  return Number.isFinite(year) ? year : null;
}

export function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|h\d)>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text || null;
}
