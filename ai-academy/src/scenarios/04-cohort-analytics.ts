// ─────────────────────────────────────────────────────────────────
// Scenario 4: Cohort Analytics Dashboard
//
// Track your entire AI Academy cohort in real time.
// Use get_analytics to answer operational questions:
//
//   "How is the spring-2026 cohort doing overall?"
//   "Which track has the highest completion rate?"
//   "Where are learners dropping off in the funnel?"
//   "How many developers haven't started in 5+ days?"
//   "Which department is ahead / behind?"
//
// MCP tool used: get_analytics (with various filter combinations)
// ─────────────────────────────────────────────────────────────────

import "dotenv/config";
import { UnfoldClient } from "../client.js";
import {
  header, section, success, info, warn, label, divider,
  progressBar, analyticsCard, badge,
} from "../utils/display.js";

const client = new UnfoldClient(
  process.env.UNFOLD_API_KEY!,
  process.env.UNFOLD_API_URL,
);

const COHORT = "spring-2026";

function funnelChart(funnel: Array<{ stepOrder: number; stepTitle: string; completionRate: number; avgHoursToComplete?: number | null }>) {
  divider();
  console.log("  Step Completion Funnel\n");
  funnel.forEach((step) => {
    const bar = progressBar(step.completionRate * 100, 25);
    const avg = step.avgHoursToComplete ? `  ⏱ avg ${step.avgHoursToComplete.toFixed(1)}h` : "";
    console.log(`  ${String(step.stepOrder).padStart(2)}. ${step.stepTitle.slice(0, 30).padEnd(30)} ${bar}${avg}`);
  });
}

function dimensionChart(dims: Array<{ dimension: string; completionRate: number; total: number; completed: number }>) {
  divider();
  console.log("  Completion by Dimension\n");
  dims.sort((a, b) => b.completionRate - a.completionRate);
  dims.forEach((d) => {
    const bar = progressBar(d.completionRate * 100, 20);
    const count = `${d.completed}/${d.total}`;
    console.log(`  ${d.dimension.padEnd(25)} ${bar}  ${count}`);
  });
}

async function run() {
  header("Scenario 4 — Cohort Analytics Dashboard");

  // ── Query 1: Overall cohort health ────────────────────────────────
  section("Query 1: Overall Cohort Health");
  info(`Cohort: ${COHORT}`);

  const overall = await client.getAnalytics({
    metadata: { cohort: COHORT },
    inactive_days: 7,
    include_funnel: true,
    include_resources: false,
  });

  analyticsCard(overall);

  if (overall.stepFunnel && overall.stepFunnel.length > 0) {
    funnelChart(overall.stepFunnel);
  }

  // ── Query 2: Completion rate by track ─────────────────────────────
  section("Query 2: Completion Rate by Track");
  info("Which AI track is driving the most completions?");

  const byTrack = await client.getAnalytics({
    metadata: { cohort: COHORT },
    group_by: "track",
    inactive_days: 7,
    include_funnel: false,
  });

  if (byTrack.completionByDimension && byTrack.completionByDimension.length > 0) {
    dimensionChart(byTrack.completionByDimension);
  } else {
    info("No dimension breakdown yet (learners still in early stages)");
  }

  // ── Query 3: At-risk learners ─────────────────────────────────────
  section("Query 3: At-Risk Learners (5+ days inactive)");
  info("Learners who haven't made any step progress in 5 days");

  const atRisk = await client.getAnalytics({
    metadata: { cohort: COHORT },
    inactive_days: 5,
    include_funnel: false,
  });

  divider();
  if (atRisk.atRiskGoals.length === 0) {
    success("No at-risk learners — great engagement!");
  } else {
    warn(`${atRisk.atRiskCount} learner(s) at risk:`);
    console.log();
    atRisk.atRiskGoals.forEach((g) => {
      const pct = g.progressPercent.toFixed(0);
      const days = g.daysInactive;
      const track = g.metadata?.track ?? "unknown";
      console.log(`  ${badge(track, "yellow")} ${g.title.slice(0, 45).padEnd(45)} ${pct}% complete, inactive ${days}d`);
    });
    console.log();
    info("Run 'npm run at-risk' to trigger automated intervention goals for these learners");
  }

  // ── Query 4: Department-level breakdown ───────────────────────────
  section("Query 4: Completion by Department");
  info("Which engineering departments are leading in AI readiness?");

  const byDept = await client.getAnalytics({
    group_by: "department",
    inactive_days: 7,
    include_funnel: false,
  });

  if (byDept.completionByDimension && byDept.completionByDimension.length > 0) {
    dimensionChart(byDept.completionByDimension);
  } else {
    info("Tag your goals with department=<name> metadata to see this breakdown");
  }

  // ── Query 5: Time-bounded cohort analysis ─────────────────────────
  section("Query 5: Q1 2026 Cohort Activity");
  info("Goals created in Q1 2026 — for quarterly reporting");

  const q1 = await client.getAnalytics({
    date_from: "2026-01-01",
    date_to: "2026-03-31",
    inactive_days: 14,
    include_funnel: false,
  });

  divider();
  label("Q1 Total Goals", q1.totalGoals);
  label("Q1 Completions", q1.completedGoals);
  label("Q1 Active", q1.activeGoals);
  label("Q1 At Risk", q1.atRiskCount);
  if (q1.avgDaysToComplete) {
    label("Avg Days to Complete", q1.avgDaysToComplete.toFixed(1));
  }
  const q1Rate = (q1.completionRate * 100).toFixed(1);
  console.log(`\n  Q1 Completion Rate:  ${progressBar(parseFloat(q1Rate))}`);

  // ── Summary ───────────────────────────────────────────────────────
  section("Suggested Actions");

  divider();
  if (overall.atRiskCount > 0) {
    warn(`Action: Reach out to ${overall.atRiskCount} at-risk learner(s) → run Scenario 5`);
  }
  if (overall.claimsPending > 0) {
    warn(`Action: ${overall.claimsPending} unclaimed goals — resend invite emails`);
  }
  if (overall.completionRate < 0.5) {
    warn("Action: Completion rate below 50% — consider adding quick-win checkpoints");
  }
  success("Analytics complete — use these KPIs in your AI Readiness Report");
}

run().catch((err) => {
  console.error("\n[Error]", err.message);
  process.exit(1);
});
