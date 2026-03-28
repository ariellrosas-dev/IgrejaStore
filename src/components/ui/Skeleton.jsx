export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-surface-200 rounded ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-full mt-4" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-lg">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ items = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-surface-300 border-t-surface-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-surface-500">Carregando...</p>
      </div>
    </div>
  )
}
