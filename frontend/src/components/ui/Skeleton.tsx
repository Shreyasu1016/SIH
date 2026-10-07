/** Shimmer loading placeholders for async-feeling demo states. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-xl bg-white/5 ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="glass space-y-3 rounded-2xl p-5">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="mt-2 h-2 w-full" />
    </div>
  )
}
