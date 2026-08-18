import { ArrowRight } from "lucide-react";
import { officialDealLabel, officialDealUrl } from "@/lib/store-links";
import { cn } from "@/lib/cn";
import type { StoreOffer } from "@/lib/types";

export function StoreDealLink({
  offer,
  className,
  children,
}: {
  offer: StoreOffer;
  className?: string;
  children?: React.ReactNode;
}) {
  const href = officialDealUrl(offer);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className)}
    >
      {children ?? (
        <>
          {officialDealLabel(offer.store)} <ArrowRight className="h-4 w-4" />
        </>
      )}
    </a>
  );
}
