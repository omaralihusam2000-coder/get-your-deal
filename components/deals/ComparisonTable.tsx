import { StoreLogo } from "@/components/ui/StoreLogo";
import { StoreDealLink } from "@/components/deals/StoreDealLink";
import { formatDiscount, formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { StoreOffer } from "@/lib/types";

export function ComparisonTable({
  offers,
  bestStore,
}: {
  offers: StoreOffer[];
  bestStore?: StoreOffer["store"] | null;
}) {
  if (!offers.length) {
    return (
      <p className="rounded-2xl border border-line bg-card p-6 text-sm text-muted">
        No live Steam or GOG prices are available for this title right now.
      </p>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
        <table className="w-full text-left">
          <thead className="bg-white/4 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Store</th>
              <th className="px-5 py-3 font-semibold">Current Price</th>
              <th className="px-5 py-3 font-semibold">Original Price</th>
              <th className="px-5 py-3 font-semibold">Discount</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const best = offer.store === bestStore;
              return (
                <tr key={offer.store} className={cn("border-t border-line", best && "bg-deal/8")}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <StoreLogo store={offer.store} />
                      {best && (
                        <span className="rounded-full bg-deal px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
                          Best Deal
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xl font-bold">{formatMoney(offer.currentPrice)}</td>
                  <td className="px-5 py-4 text-muted line-through">{formatMoney(offer.originalPrice)}</td>
                  <td className="px-5 py-4 font-semibold text-deal">
                    {offer.discountPercent > 0 ? formatDiscount(offer.discountPercent) : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <StoreDealLink
                      offer={offer}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-bold text-black hover:bg-deal"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {offers.map((offer) => {
          const best = offer.store === bestStore;
          return (
            <div
              key={offer.store}
              className={cn("rounded-2xl border border-line bg-card p-4", best && "border-deal/40 bg-deal/8")}
            >
              <div className="flex items-center justify-between">
                <StoreLogo store={offer.store} />
                {best && (
                  <span className="rounded-full bg-deal px-2 py-0.5 text-[10px] font-bold uppercase text-black">
                    Best Deal
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-bold">{formatMoney(offer.currentPrice)}</span>
                <span className="text-sm text-muted line-through">{formatMoney(offer.originalPrice)}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-deal">
                {offer.discountPercent > 0 ? formatDiscount(offer.discountPercent) : "No current discount"}
              </p>
              {offer.currentPrice.convertedFrom && (
                <p className="mt-1 text-xs text-muted">Converted from {offer.currentPrice.convertedFrom}</p>
              )}
              <StoreDealLink
                offer={offer}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black"
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
