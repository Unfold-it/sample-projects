import type { AnalyticsResult } from "@/lib/types";

type Dim = NonNullable<AnalyticsResult["completionByDimension"]>[number];

const TRACK_COLORS: Record<string, string> = {
  "data-ml":  "#22d3ee",
  frontend:   "#a78bfa",
  devops:     "#fb923c",
  backend:    "#4ade80",
};

const TRACK_LABELS: Record<string, string> = {
  "data-ml":  "Data & ML",
  frontend:   "Frontend",
  devops:     "DevOps",
  backend:    "Backend",
};

export function TrackBreakdown({ dims }: { dims: Dim[] }) {
  if (dims.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-8">No track data yet</p>;
  }

  const sorted = [...dims].sort((a, b) => b.completionRate - a.completionRate);

  return (
    <div className="space-y-4">
      {sorted.map((d) => {
        const pct = d.completionRate * 100;
        const color = TRACK_COLORS[d.dimension] ?? "#6366f1";
        const label = TRACK_LABELS[d.dimension] ?? d.dimension;

        return (
          <div key={d.dimension}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-xs text-slate-300">{label}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{d.completed}/{d.total}</span>
                <span className="font-semibold text-slate-300">{pct.toFixed(0)}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color, opacity: 0.85 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
