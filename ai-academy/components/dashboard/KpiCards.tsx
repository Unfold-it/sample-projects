import type { AnalyticsResult } from "@/lib/types";

interface KpiCardProps { label: string; value: string | number; sub?: string; color?: string; }

function KpiCard({ label, value, sub, color = "text-white" }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] p-5 flex flex-col gap-1" style={{ background: "var(--surface)" }}>
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <span className={`text-3xl font-bold leading-none ${color}`}>{value}</span>
      {sub && <span className="text-xs text-slate-500 mt-0.5">{sub}</span>}
    </div>
  );
}

export function KpiCards({ analytics }: { analytics: AnalyticsResult }) {
  const activation = analytics.claimsTotal > 0
    ? `${((analytics.claimsClaimed / analytics.claimsTotal) * 100).toFixed(0)}% activation`
    : undefined;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-full">
      <KpiCard label="Enrolled"  value={analytics.totalGoals}    sub={activation} />
      <KpiCard label="Active"    value={analytics.activeGoals}   sub={`${analytics.completedGoals} completed`} />
      <KpiCard label="Completion" value={`${(analytics.completionRate * 100).toFixed(0)}%`} sub={analytics.avgDaysToComplete ? `avg ${analytics.avgDaysToComplete.toFixed(1)}d` : undefined} color="text-violet-400" />
      <KpiCard label="At Risk"   value={analytics.atRiskCount}   sub={`${analytics.inactiveThresholdDays}d inactive`} color={analytics.atRiskCount > 0 ? "text-red-400" : "text-white"} />
    </div>
  );
}
