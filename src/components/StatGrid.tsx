export interface StatItem {
  label: string;
  value: string;
  hint?: string;
}

/** A row of headline numbers. Tabular figures so they do not jitter as they change. */
export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="stat-grid">
      {items.map((item) => (
        <div className="stat-tile" key={item.label} title={item.hint}>
          <div className="stat-value mono">{item.value}</div>
          <div className="stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
