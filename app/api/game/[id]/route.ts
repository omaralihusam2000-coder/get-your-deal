import { NextResponse } from "next/server";
import { getGameDetails } from "@/lib/deals";
import { getRequestCurrency } from "@/lib/currency-server";
import { CURRENCIES, type CurrencyCode } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const requested = url.searchParams.get("currency");
  const currency: CurrencyCode =
    requested && (CURRENCIES as readonly string[]).includes(requested)
      ? (requested as CurrencyCode)
      : await getRequestCurrency();
  const game = await getGameDetails(id, currency);
  if (!game) {
    return NextResponse.json({ error: "Game not found or price data is unavailable." }, { status: 404 });
  }
  return NextResponse.json(game);
}
