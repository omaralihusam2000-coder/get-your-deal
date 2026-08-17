import { NextResponse } from "next/server";
import { queryDeals } from "@/lib/deals";
import { parseDealQuery } from "@/lib/deals/query";
import { getRequestCurrency } from "@/lib/currency-server";
import { CURRENCIES, type CurrencyCode } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const requested = params.currency;
  const currency: CurrencyCode =
    requested && (CURRENCIES as readonly string[]).includes(requested)
      ? (requested as CurrencyCode)
      : await getRequestCurrency();
  const query = parseDealQuery(params, { currency, pageSize: 24 });
  const result = await queryDeals(query);
  return NextResponse.json(result);
}
