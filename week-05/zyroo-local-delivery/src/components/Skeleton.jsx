export function Skeleton({ width, height = 14, radius = 6, style }) {
  return (
    <span
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

export function TableSkeleton({ rows = 4, cols = 5 }) {
  return (
    <div className="table-skeleton">
      {Array.from({ length: rows }).map((_, r) => (
        <div className="table-skeleton-row" key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} width={c === 0 ? "18%" : `${70 / cols}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="stat-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="stat-card" key={i}>
          <Skeleton width="60%" height={12} style={{ marginBottom: 14 }} />
          <Skeleton width="40%" height={28} radius={8} />
        </div>
      ))}
    </div>
  );
}
