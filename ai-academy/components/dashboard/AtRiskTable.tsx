import type { AnalyticsResult } from "@/lib/types";
import Link from "next/link";

type AtRisk = AnalyticsResult["atRiskGoals"][number];

const TRACK_COLORS: Record<string, string> = {
  backend: "text-emerald-400 bg-emerald-950/50 border-emerald-900/50",
  frontend: "text-violet-400 bg-violet-950/50 border-violet-900/50",
  devops: "text-orange-400 bg-orange-950/50 border-orange-900/50",
  "data-ml": "text-cyan-400 bg-cyan-950/50 border-cyan-900/50",
};

function ProgressMini({ pct }: { pct: number }) {
  const color = pct > 60 ? "#a78bfa" : pct > 30 ? "#fbbf24" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs text-slate-400 w-8">{pct.toFixed(0)}%</span>
    </div>
  );
}

export function AtRiskTable({ goals }: { goals: AtRisk[] }) {
  if (goals.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        No at-risk learners — great engagement!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-[var(--border)]">
            <th className="text-left pb-3 font-medium">Learner</th>
            <th className="text-left pb-3 font-medium">Track</th>
            <th className="text-left pb-3 font-medium">Progress</th>
            <th className="text-left pb-3 font-medium">Inactive</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {goals.map((g) => {
            const track = g.metadata?.track ?? "unknown";
            const email = g.metadata?.learner_email ?? "–";
            const name = email.split("@")[0]?.replace(".", " ") ?? email;
            const trackClass = TRACK_COLORS[track] ?? "text-slate-400 bg-slate-900/50 border-slate-800/50";

            return (
              <tr key={g.goalId} className="group">
                <td className="py-3 pr-4">
                  <div className="font-medium text-slate-200 capitalize">{name}</div>
                  <div className="text-xs text-slate-500">{email}</div>
                </td>
                <td className="py-3 pr-4">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${trackClass}`}>
                    {track}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <ProgressMini pct={g.progressPercent} />
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs text-red-400">{g.daysInactive}d inactive</span>
                </td>
                <td className="py-3 text-right">
                  <Link
                    href="/enroll"
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Create help plan →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
