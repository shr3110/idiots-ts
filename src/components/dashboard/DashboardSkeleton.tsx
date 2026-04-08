export function DashboardSkeleton() {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3 mb-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="skeleton rounded-card"
            style={{ height: '200px' }}
          />
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="skeleton rounded-[12px]"
            style={{ height: '56px' }}
          />
        ))}
      </div>
    </div>
  )
}
