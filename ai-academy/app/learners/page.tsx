import { unfold } from "@/lib/unfold";
import { DEMO_GOALS } from "@/lib/demo-data";
import type { GoalStatus } from "@/lib/types";
import Link from "next/link";

async function getData() {
  if (!process.env.UNFOLD_API_KEY) return { goals: DEMO_GOALS.goals, total: DEMO_GOALS.total, demo: true };
  try {
    const result = await unfold.listGoals({ limit: 50 });
    return { goals: result.goals, total: result.total, demo: false };
  } catch {
    return { goals: DEMO_GOALS.goals, total: DEMO_GOALS.total, demo: true };
  }
}

const TRACK_CHIP: Record<string, string> = {
  backend:   "text-emerald-400 bg-emerald-950/50 border-emerald-900/50",
  frontend:  "text-violet-400 bg-violet-950/50 border-violet-900/50",
  devops:    "text-orange-400 bg-orange-950/50 border-orange-900/50",
  "data-ml": "text-cyan-400 bg-cyan-950/50 border-cyan-900/50",
};

const STATUS_CHIP: Record<string, string> = {
  completed:   "text-emerald-400 bg-emerald-950/50 border-emerald-900/50",
  in_progress: "text-violet-400 bg-violet-950/50 border-violet-900/50",
  blocked:     "text-red-400 bg-red-950/50 border-red-900/50",
  draft:       "text-slate-400 bg-slate-900/50 border-slate-800/50",
  paused:      "text-amber-400 bg-amber-950/50 border-amber-900/50",
};

function ProgressBar({ pct, status }: { pct: number; status: string }) {
  const color = status === "completed" ? "#4ade80" : pct > 60 ? "#a78bfa" : pct > 30 ? "#6366f1" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs text-slate-400">{pct.toFixed(0)}%</span>
    </div>
  );
}

function daysAgo(iso: string | null) {
  if (!iso) return "–";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export default async function LearnersPage() {
  const { goals, total } = await getData();

  const atRiskCount = goals.filter((g) => {
    if (!g.lastActivityAt) return false;
    return (Date.now() - new Date(g.lastActivityAt).getTime()) > 7 * 86400000;
  }).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Learners</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} enrolled — spring-2026</p>
        </div>
        <Link
          href="/enroll"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        >
          <span className="text-lg leading-none">+</span> Enroll
        </Link>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <div className="px-3 py-1.5 rounded-full border border-[var(--border)] text-xs text-slate-400">
          {goals.filter((g) => g.status === "in_progress").length} active
        </div>
        <div className="px-3 py-1.5 rounded-full border border-[var(--border)] text-xs text-slate-400">
          {goals.filter((g) => g.status === "completed").length} completed
        </div>
        {atRiskCount > 0 && (
          <div className="px-3 py-1.5 rounded-full border border-red-900/50 text-xs text-red-400 bg-red-950/30">
            {atRiskCount} at risk
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden" style={{ background: "var(--surface)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs text-slate-500">
              <th className="text-left px-6 py-4 font-medium">Learner</th>
              <th className="text-left px-4 py-4 font-medium hidden sm:table-cell">Track</th>
              <th className="text-left px-4 py-4 font-medium">Progress</th>
              <th className="text-left px-4 py-4 font-medium hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-4 font-medium hidden lg:table-cell">Last active</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {goals.map((g) => {
              const email = g.assignedTo?.email ?? g.metadata?.learner_email ?? "–";
              const name = g.assignedTo?.fullName ?? email.split("@")[0]?.replace(".", " ") ?? email;
              const track = g.metadata?.track ?? "–";
              const isAtRisk = g.lastActivityAt
                ? (Date.now() - new Date(g.lastActivityAt).getTime()) > 7 * 86400000
                : false;

              return (
                <tr key={g.goalId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-violet-900/60 border border-violet-800/50 flex items-center justify-center text-xs font-bold text-violet-300 shrink-0">
                        {String(name).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-200 capitalize truncate">{name}</div>
                        <div className="text-xs text-slate-500 truncate">{email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${TRACK_CHIP[track] ?? "text-slate-400 bg-slate-900/50 border-slate-800"}`}>
                      {track}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ProgressBar pct={g.progress.overallPercent} status={g.status} />
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_CHIP[g.status] ?? "text-slate-400 bg-slate-900/50 border-slate-800"}`}>
                      {g.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className={`text-xs ${isAtRisk ? "text-red-400" : "text-slate-500"}`}>
                      {daysAgo(g.lastActivityAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAtRisk && (
                      <Link href="/enroll" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                        Help →
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
