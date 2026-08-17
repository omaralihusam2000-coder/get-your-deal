"use client";

import { formatDate, formatMoney } from "@/lib/format";
import type { PriceHistory } from "@/lib/types";

export function PriceChart({ history }: { history: PriceHistory }) {
  if (!history.available || history.points.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-card p-8 text-center">
        <p className="text-lg font-semibold">Price history unavailable</p>
        <p className="mt-2 text-sm text-muted">
          We never invent historical graphs. A complete sale-period series is not published by Steam or GOG.
        </p>
        {history.lowestRecorded && (
          <p className="mt-4 text-deal">
            Lowest recorded price: {formatMoney(history.lowestRecorded)}
            {history.lowestRecordedDate ? ` on ${formatDate(history.lowestRecordedDate)}` : ""}
          </p>
        )}
      </div>
    );
  }

  const values = history.points.map((point) => point.price.amount);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const width = 640;
  const height = 220;
  const pad = 24;

  const coords = history.points.map((point, index) => {
    const x = pad + (index / (history.points.length - 1)) * (width - pad * 2);
    const y = pad + ((max - point.price.amount) / span) * (height - pad * 2);
    return { x, y, point };
  });

  const path = coords.map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x},${coord.y}`).join(" ");

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Recorded prices</p>
          <p className="mt-1 text-2xl font-bold text-deal">
            Lowest Price Ever: {formatMoney(history.lowestRecorded)}
          </p>
        </div>
        {history.current && (
          <p className="text-sm text-muted">
            Current: <span className="font-semibold text-foreground">{formatMoney(history.current)}</span>
          </p>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        <path d={path} fill="none" stroke="#39FF88" strokeWidth="3" />
        {coords.map((coord) => (
          <g key={coord.point.label}>
            <circle cx={coord.x} cy={coord.y} r="6" fill="#39FF88" />
            <text x={coord.x} y={coord.y - 12} textAnchor="middle" fill="#9AA3B5" fontSize="11">
              {coord.point.label}
            </text>
            <text x={coord.x} y={height - 6} textAnchor="middle" fill="#9AA3B5" fontSize="11">
              {formatDate(coord.point.date)}
            </text>
          </g>
        ))}
      </svg>
      {history.note && <p className="mt-2 text-xs text-muted">{history.note}</p>}
    </div>
  );
}
