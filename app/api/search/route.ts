import { NextResponse } from "next/server";
import { searchGames } from "@/lib/deals";
import { getRequestCurrency } from "@/lib/currency-server";
import { CURRENCIES, type CurrencyCode } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const requested = url.searchParams.get("currency");
  const currency: CurrencyCode =
    requested && (CURRENCIES as readonly string[]).includes(requested)
      ? (requested as CurrencyCode)
      : await getRequestCurrency();
  if (q.length < 2) {
    return NextResponse.json({ games: [], query: q, currency, sources: { cheapshark: "skipped", steam: "skipped", gog: "skipped", fx: "skipped" }, fetchedAt: new Date().toISOString() });
  }
  const result = await searchGames(q, currency);
  return NextResponse.json(result);
}
