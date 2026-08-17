import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

export function DealCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function DealGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <DealCardSkeleton key={index} />
      ))}
    </div>
  );
}
