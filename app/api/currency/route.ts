import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CURRENCY_COOKIE } from "@/lib/currency-server";
import { CURRENCIES, type CurrencyCode } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { currency?: string };
  const currency = body.currency as CurrencyCode;
  if (!CURRENCIES.includes(currency)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const store = await cookies();
  store.set(CURRENCY_COOKIE, currency, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return NextResponse.json({ ok: true, currency });
}
