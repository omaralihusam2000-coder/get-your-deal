import "server-only";

import { cached } from "../cache";
import { fetchJson } from "../http";
import type { CurrencyCode, FxRates, Money } from "../types";

const FX_BASE = process.env.FX_API_BASE ?? "https://api.frankfurter.app";

export async function getUsdRates(): Promise<FxRates> {
  return cached("fx:usd", 60 * 60 * 1000, async () => {
    const url = `${FX_BASE}/latest?from=USD&to=EUR,GBP`;
    const data = await fetchJson<{
      base: string;
      date: string;
      rates: { EUR?: number; GBP?: number };
    }>(url, { revalidate: 3600 });

    return {
      base: "USD",
      rates: {
        USD: 1,
        EUR: data.rates.EUR ?? 0,
        GBP: data.rates.GBP ?? 0,
      },
      fetchedAt: new Date().toISOString(),
    };
  });
}

export function convertUsd(amount: number, currency: CurrencyCode, rates: FxRates): Money {
  if (currency === "USD") return { amount, currency: "USD" };
  const rate = rates.rates[currency];
  if (!rate) return { amount, currency: "USD" };
  return {
    amount: Math.round(amount * rate * 100) / 100,
    currency,
    convertedFrom: "USD",
  };
}

export function convertMoney(money: Money, currency: CurrencyCode, rates: FxRates): Money {
  if (money.currency === currency) return { ...money, convertedFrom: undefined };
  if (money.currency === "USD") return convertUsd(money.amount, currency, rates);
  if (currency === "USD") {
    const rate = rates.rates[money.currency];
    if (!rate) return money;
    return {
      amount: Math.round((money.amount / rate) * 100) / 100,
      currency: "USD",
      convertedFrom: money.currency,
    };
  }
  const usd = convertMoney(money, "USD", rates);
  return convertUsd(usd.amount, currency, rates);
}
