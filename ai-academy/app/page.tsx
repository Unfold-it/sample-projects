import { HealthScoreRing } from "@/components/dashboard/HealthScoreRing";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { TrackBreakdown } from "@/components/dashboard/TrackBreakdown";
import { AtRiskTable } from "@/components/dashboard/AtRiskTable";
import { DEMO_ANALYTICS, DEMO_BY_TRACK, computeHealthScore } from "@/lib/demo-data";
import { unfold } from "@/lib/unfold";
import type { AnalyticsResult } from "@/lib/types";

async function getData() {
  if (!process.env.UNFOLD_API_KEY) {
    return {
      analytics: DEMO_ANALYTICS,
      byTrack: DEMO_BY_TRACK,
      demo: true,
    };
  }
  try {
    const [analytics, byTrack] = await Promise.all([
      unfold.getAnalytics({ inactiveDays: 7, includeFunnel: true }),
      unfold.getAnalytics({ groupBy: "track", includeFunnel: false }),
    ]);
    return { analytics, byTrack, demo: false };
  } catch {
    return { analytics: DEMO_ANALYTICS, byTrack: DEMO_BY_TRACK, demo: true };
  }
}

export default async function DashboardPage() {
  const { analytics, byTrack } = await getData();
  const healthScore = computeHealthScore(analytics);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Cohort Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI Fundamentals — Q2 2026</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Live
        </div>
      </div>

      {/* Health + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1 rounded-xl border border-[var(--border)] p-6 flex flex-col items-center justify-center gap-3" style={{ background: "var(--surface)" }}>
          <HealthScoreRing score={healthScore} />
          <div className="text-center">
            <div className="text-xs text-slate-500">Health Score</div>
            <div className="text-xs text-slate-600 mt-0.5">spring-2026</div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <KpiCards analytics={analytics} />
        </div>
      </div>

      {/* Funnel + Track Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-xl border border-[var(--border)] p-6" style={{ background: "var(--surface)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white">Step Completion Funnel</h2>
              <p className="text-xs text-slate-500 mt-0.5">Where engineers drop off</p>
            </div>
          </div>
          <FunnelChart steps={analytics.stepFunnel ?? []} />
        </div>
        <div className="lg:col-span-2 rounded-xl border border-[var(--border)] p-6" style={{ background: "var(--surface)" }}>
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">Completion by Track</h2>
            <p className="text-xs text-slate-500 mt-0.5">Role-based breakdown</p>
          </div>
          <TrackBreakdown dims={byTrack.completionByDimension ?? []} />
        </div>
      </div>

      {/* At-Risk */}
      <div className="rounded-xl border border-[var(--border)] p-6" style={{ background: "var(--surface)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white">At-Risk Learners</h2>
            <p className="text-xs text-slate-500 mt-0.5">Inactive 7+ days</p>
          </div>
          {analytics.atRiskCount > 0 && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-950/60 text-red-400 border border-red-900/50">
              {analytics.atRiskCount} at risk
            </span>
          )}
        </div>
        <AtRiskTable goals={analytics.atRiskGoals} />
      </div>
    </div>
  );
}
