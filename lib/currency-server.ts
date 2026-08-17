import { cookies } from "next/headers";
import type { CurrencyCode } from "./types";

export const CURRENCY_COOKIE = "dealforge_currency";

export async function getRequestCurrency(): Promise<CurrencyCode> {
  const store = await cookies();
  const value = store.get(CURRENCY_COOKIE)?.value;
  if (value === "EUR" || value === "GBP" || value === "USD") return value;
  return "USD";
}
