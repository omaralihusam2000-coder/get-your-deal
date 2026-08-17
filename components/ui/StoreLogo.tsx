import { cn } from "@/lib/cn";
import type { StoreSlug } from "@/lib/types";

export function StoreLogo({ store, className }: { store: StoreSlug; className?: string }) {
  if (store === "steam") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide", className)}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M12 2a10 10 0 0 0-1.63 19.86l4.27-1.76a3.25 3.25 0 0 0 2.3-3.86 3.26 3.26 0 0 0-3.2-2.55 3.2 3.2 0 0 0-1.27.26l-3.02 1.24A5.73 5.73 0 0 1 12 6.27 5.73 5.73 0 0 1 17.73 12a5.73 5.73 0 0 1-8.4 5.06l-3.48 1.43A10 10 0 0 0 12 2Zm3.12 7.38a2.12 2.12 0 1 0 0 4.24 2.12 2.12 0 0 0 0-4.24Zm-6.9 5.16 2.24-.92a2.5 2.5 0 0 0 1.8 2.2l-2.3.95a1.62 1.62 0 1 1-1.74-2.23Z" />
        </svg>
        Steam
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide", className)}>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M12 2 3.5 6.5v11L12 22l8.5-4.5v-11L12 2Zm0 2.2 6.3 3.34v.92L12 11.8 5.7 8.46v-.92L12 4.2Zm-6.3 5.7 6.05 3.2v6.55L5.7 16.44V9.9Zm7.55 9.75v-6.55l6.05-3.2v6.54l-6.05 3.21Z" />
      </svg>
      GOG
    </span>
  );
}
