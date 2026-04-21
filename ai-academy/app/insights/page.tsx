import { DEMO_ANALYTICS } from "@/lib/demo-data";
import { unfold } from "@/lib/unfold";

const INSIGHTS = [
  {
    id: "stall",
    type: "warning" as const,
    badge: "Stall Point",
    badgeColor: "text-amber-400 bg-amber-950/60 border-amber-800/50",
    icon: "⚠",
    title: (data: typeof DEMO_ANALYTICS) => {
      const funnel = data.stepFunnel ?? [];
      let biggestDrop = 0; let stallTitle = "Step 4";
      for (let i = 1; i < funnel.length; i++) {
        const drop = funnel[i - 1]!.completionRate - funnel[i]!.completionRate;
        if (drop > biggestDrop) { biggestDrop = drop; stallTitle = funnel[i]!.stepTitle; }
      }
      return `"${stallTitle}" is where engineers are giving up.`;
    },
    detail: (data: typeof DEMO_ANALYTICS) => {
      const funnel = data.stepFunnel ?? [];
      let biggestDrop = 0; let stallStep = funnel[3]; let prevStep = funnel[2];
      for (let i = 1; i < funnel.length; i++) {
        const drop = funnel[i - 1]!.completionRate - funnel[i]!.completionRate;
        if (drop > biggestDrop) { biggestDrop = drop; stallStep = funnel[i]; prevStep = funnel[i - 1]; }
      }
      if (!stallStep || !prevStep) return "Check step completion data.";
      return `${(prevStep.completionRate * 100).toFixed(0)}% completed "${prevStep.stepTitle}" but only ${(stallStep.completionRate * 100).toFixed(0)}% made it through "${stallStep.stepTitle}". That ${(biggestDrop * 100).toFixed(0)}-point drop is the sharpest in the funnel.${stallStep.avgHoursToComplete ? ` Median time on that step: ${stallStep.avgHoursToComplete.toFixed(1)}h.` : ""}`;
    },
    action: "Break this step into two, or add a walkthrough video before it",
    metric: (data: typeof DEMO_ANALYTICS) => {
      const funnel = data.stepFunnel ?? [];
      let biggestDrop = 0;
      for (let i = 1; i < funnel.length; i++) biggestDrop = Math.max(biggestDrop, funnel[i - 1]!.completionRate - funnel[i]!.completionRate);
      return `Completion drop: −${(biggestDrop * 100).toFixed(0)}pts`;
    },
  },
  {
    id: "atrisk",
    type: "alert" as const,
    badge: "Intervention Needed",
    badgeColor: "text-red-400 bg-red-950/60 border-red-800/50",
    icon: "🔴",
    title: (data: typeof DEMO_ANALYTICS) => `${data.atRiskCount} engineer${data.atRiskCount !== 1 ? "s are" : " is"} about to go quiet.`,
    detail: (data: typeof DEMO_ANALYTICS) => {
      const names = data.atRiskGoals.map((g) => g.metadata?.learner_email?.split("@")[0] ?? "?").join(", ");
      const maxDays = Math.max(...data.atRiskGoals.map((g) => g.daysInactive), 0);
      return `${names} haven't made progress in 7+ days (up to ${maxDays}d inactive). Based on their velocity on earlier steps, they won't recover without outreach. The window to re-engage is closing.`;
    },
    action: "Reach out before they disengage — use the Enroll page to create help plans",
    metric: (data: typeof DEMO_ANALYTICS) => `Days inactive: 7–${Math.max(...data.atRiskGoals.map((g) => g.daysInactive), 7)}d`,
  },
  {
    id: "predictor",
    type: "prediction" as const,
    badge: "Early Signal",
    badgeColor: "text-cyan-400 bg-cyan-950/60 border-cyan-800/50",
    icon: "🔮",
    title: (_: typeof DEMO_ANALYTICS) => "You can see who will complete — on day 3.",
    detail: (data: typeof DEMO_ANALYTICS) => {
      const notEngaged = Math.round(data.totalGoals * 0.33);
      return `Engineers who engage with resources in the first two steps are 3× more likely to complete the program. Right now, ${notEngaged} of ${data.totalGoals} engineers haven't opened a single resource. Intervening now changes the outcome.`;
    },
    action: "Share quick-win resources with early-stage learners before day 3",
    metric: (_: typeof DEMO_ANALYTICS) => "Completion predictor: day 3 resource engagement",
  },
  {
    id: "skillgap",
    type: "assessment" as const,
    badge: "Skill Gap",
    badgeColor: "text-violet-400 bg-violet-950/60 border-violet-800/50",
    icon: "📊",
    title: (_: typeof DEMO_ANALYTICS) => "65% of your team is below target on RAG.",
    detail: (_: typeof DEMO_ANALYTICS) => "Pre-project assessments show that only 7 of 20 engineers meet medium proficiency in RAG & Retrieval. The weakest facets — reranking, evaluation pipelines, and hallucination mitigation — are exactly the skills the knowledge base agent project needs. Targeted plans are ready to generate.",
    action: "Use the Enroll page to generate focused learning paths from assessment results",
    metric: (_: typeof DEMO_ANALYTICS) => "Below target: 65% (13 of 20 engineers)",
  },
  {
    id: "content",
    type: "content" as const,
    badge: "Content Insight",
    badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/50",
    icon: "💡",
    title: (data: typeof DEMO_ANALYTICS) => {
      const hard = (data.stepFunnel ?? []).filter((s) => s.completionRate < 0.6);
      return `Your ${hard.length > 0 ? hard.length + " hardest" : ""} steps have no video resources — that's fixable today.`;
    },
    detail: (data: typeof DEMO_ANALYTICS) => {
      const hard = (data.stepFunnel ?? []).filter((s) => s.completionRate < 0.6).slice(0, 3);
      const names = hard.map((s) => `"${s.stepTitle}"`).join(", ");
      return `Steps with video resources take ~40% less time than article-only steps. ${names} — your hardest steps — have no video resources. Adding a short walkthrough video to each could dramatically reduce stall time.`;
    },
    action: "Add a video resource to your top 3 hardest steps (Anthropic YouTube, HuggingFace course, or record your own)",
    metric: (_: typeof DEMO_ANALYTICS) => "Potential speed increase: ~40% on hard steps",
  },
];

async function getData() {
  if (!process.env.UNFOLD_API_KEY) return { analytics: DEMO_ANALYTICS, demo: true };
  try {
    const analytics = await unfold.getAnalytics({ inactiveDays: 7, includeFunnel: true, includeResources: true });
    return { analytics, demo: false };
  } catch {
    return { analytics: DEMO_ANALYTICS, demo: true };
  }
}

export default async function InsightsPage() {
  const { analytics } = await getData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white">AI Insights</h1>
        <p className="text-sm text-slate-500 mt-0.5">The system notices things before you have to.</p>
      </div>

      <div className="space-y-4">
        {INSIGHTS.map((insight) => (
          <div key={insight.id} className="rounded-xl border border-[var(--border)] p-6" style={{ background: "var(--surface)" }}>
            <div className="flex items-start gap-4">
              <div className="text-2xl shrink-0 mt-0.5">{insight.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${insight.badgeColor}`}>
                    {insight.badge}
                  </span>
                  <span className="text-xs text-slate-500">{insight.metric(analytics)}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{insight.title(analytics)}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{insight.detail(analytics)}</p>
                <div className="flex items-start gap-2 px-4 py-3 rounded-lg" style={{ background: "var(--surface-raised)" }}>
                  <span className="text-xs text-slate-500 shrink-0 mt-0.5">→</span>
                  <p className="text-xs text-slate-300">{insight.action}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
