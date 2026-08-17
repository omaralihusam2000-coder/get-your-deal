import { DealGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="skeleton mb-6 h-12 w-80 rounded-2xl" />
      <DealGridSkeleton count={8} />
    </div>
  );
}
