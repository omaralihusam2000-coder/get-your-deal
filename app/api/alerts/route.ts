import { NextResponse } from "next/server";
import { deleteCheapSharkAlert, setCheapSharkAlert } from "@/lib/providers/cheapshark";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: "set" | "delete";
    email?: string;
    gameId?: string;
    price?: number;
  };

  const email = body.email?.trim();
  const gameId = body.gameId?.trim();
  if (!email || !gameId || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "A valid email and game are required." }, { status: 400 });
  }

  try {
    if (body.action === "delete") {
      await deleteCheapSharkAlert(email, gameId);
      return NextResponse.json({ ok: true });
    }
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ ok: false, error: "Enter a target price greater than 0." }, { status: 400 });
    }
    await setCheapSharkAlert(email, gameId, price);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "The email alert service is unavailable right now." },
      { status: 502 },
    );
  }
}
