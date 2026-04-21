import type { AnalyticsResult } from "@/lib/types";

type Step = NonNullable<AnalyticsResult["stepFunnel"]>[number];

export function FunnelChart({ steps }: { steps: Step[] }) {
  if (steps.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-8">No funnel data yet</p>;
  }

  const firstRate = steps[0]?.completionRate ?? 1;

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1]!.completionRate : firstRate;
        const drop = prev - step.completionRate;
        const isStall = drop > 0.18;
        const pct = step.completionRate * 100;
        const barColor = isStall ? "#f87171" : pct > 70 ? "#a78bfa" : "#6366f1";

        return (
          <div key={step.stepOrder} className="group">
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-slate-600 w-5 shrink-0">{step.stepOrder}</span>
                <span className="text-xs text-slate-300 truncate">{step.stepTitle}</span>
                {isStall && (
                  <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-900/50">
                    STALL −{(drop * 100).toFixed(0)}pts
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {step.avgHoursToComplete && (
                  <span className="text-[10px] text-slate-600">⏱ {step.avgHoursToComplete.toFixed(1)}h</span>
                )}
                <span className="text-xs font-semibold text-slate-300 w-10 text-right">{pct.toFixed(0)}%</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
