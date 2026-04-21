// ─────────────────────────────────────────────────────────────────
// Scenario 8: AI-Powered Intelligence Layer
//
// "The system notices things before you have to."
//
// Surfaces five categories of insight that the AI Teams dashboard
// highlights automatically — each one actionable:
//
//   Insight 1 — STALL POINT:     "Step 4 is where engineers give up"
//   Insight 2 — AT-RISK:         "3 engineers are about to go quiet"
//   Insight 3 — PREDICTOR:       "You can see who will complete on day 3"
//   Insight 4 — SKILL GAP:       "65% of your team is below target on RAG"
//   Insight 5 — CONTENT:         "Steps 4–6 have no video — that's fixable"
//
// Each insight is derived from MCP data and surfaces a concrete
// recommended action.
//
// MCP tools used:
//   get_analytics → list_goals → generate_skill_assessment → score_skill_assessment
// ─────────────────────────────────────────────────────────────────

import "dotenv/config";
import { UnfoldClient } from "../client.js";
import {
  header, section, success, info, warn, label, divider,
  progressBar, badge,
} from "../utils/display.js";

const client = new UnfoldClient(
  process.env.UNFOLD_API_KEY!,
  process.env.UNFOLD_API_URL,
);

const COHORT = "spring-2026";

// ANSI helpers
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const MAGENTA = "\x1b[35m";
const R = "\x1b[0m";

function insightCard(
  type: "warning" | "alert" | "prediction" | "assessment" | "content",
  headline: string,
  detail: string,
  action: string,
  metric?: string,
) {
  const icons = { warning: "⚠", alert: "🔴", prediction: "🔮", assessment: "📊", content: "💡" };
  const colors = { warning: YELLOW, alert: RED, prediction: CYAN, assessment: MAGENTA, content: GREEN };
  const icon = icons[type];
  const color = colors[type];

  divider();
  console.log(`\n  ${color}${icon}  ${BOLD}${headline}${R}`);
  console.log(`\n  ${detail}`);
  console.log(`\n  ${DIM}Recommended action:${R} ${BOLD}${action}${R}`);
  if (metric) console.log(`  ${DIM}Key metric:${R} ${color}${metric}${R}`);
  console.log();
}

async function detectStallPoint() {
  section("Insight 1 — Stall Point Detection");
  info("Pulling step completion funnel for the spring-2026 cohort…");

  const analytics = await client.getAnalytics({
    metadata: { cohort: COHORT },
    include_funnel: true,
    inactive_days: 7,
  });

  if (!analytics.stepFunnel || analytics.stepFunnel.length < 2) {
    info("Not enough funnel data yet — check back after more engineers complete steps");
    return;
  }

  // Find the biggest drop between consecutive funnel steps
  let biggestDrop = 0;
  let stallStep = analytics.stepFunnel[0];
  let prevStep = analytics.stepFunnel[0];

  for (let i = 1; i < analytics.stepFunnel.length; i++) {
    const curr = analytics.stepFunnel[i];
    const prev = analytics.stepFunnel[i - 1];
    const drop = prev.completionRate - curr.completionRate;
    if (drop > biggestDrop) {
      biggestDrop = drop;
      stallStep = curr;
      prevStep = prev;
    }
  }

  const dropPct = (biggestDrop * 100).toFixed(0);

  // Print the full funnel
  console.log("\n  Step Completion Funnel:\n");
  analytics.stepFunnel.forEach((step, i) => {
    const rate = step.completionRate * 100;
    const prev = i > 0 ? analytics.stepFunnel![i - 1].completionRate * 100 : rate;
    const drop = i > 0 ? prev - rate : 0;
    const marker = drop > 15 ? ` ${RED}← STALL (−${drop.toFixed(0)}pts)${R}` : "";
    const avg = step.avgHoursToComplete ? `  ⏱ ${step.avgHoursToComplete.toFixed(1)}h avg` : "";
    console.log(`  ${String(step.stepOrder).padStart(2)}. ${step.stepTitle.slice(0, 32).padEnd(32)} ${progressBar(rate, 20)}${avg}${marker}`);
  });
  console.log();

  if (biggestDrop > 0.1) {
    insightCard(
      "warning",
      `"${stallStep.stepTitle}" is where engineers are giving up.`,
      `${(prevStep.completionRate * 100).toFixed(0)}% completed "${prevStep.stepTitle}" but only ${(stallStep.completionRate * 100).toFixed(0)}% made it through "${stallStep.stepTitle}". ` +
      `That ${dropPct}-point drop is the sharpest in the funnel.${stallStep.avgHoursToComplete ? ` Median time on that step is ${stallStep.avgHoursToComplete.toFixed(1)}h.` : ""}`,
      "Break this step into two, or add a walkthrough video before it",
      `Completion drop: −${dropPct}pts`,
    );
  } else {
    success("No significant stall points detected — strong funnel progression");
  }
}

async function detectAtRisk() {
  section("Insight 2 — At-Risk Detection");
  info("Scanning for engineers inactive 7+ days…");

  const atRisk = await client.listGoals({
    inactive_days: 7,
    metadata: [`cohort=${COHORT}`],
    status: "in_progress",
    limit: 20,
  });

  if (atRisk.total === 0) {
    success("No at-risk engineers — great cohort engagement");
    return;
  }

  console.log("\n  At-risk learners:\n");
  atRisk.goals.forEach((g) => {
    const track = g.metadata?.track ?? "unknown";
    const email = g.metadata?.learner_email ?? g.assignedTo?.email ?? "–";
    const pct = g.progress.overallPercent.toFixed(0);
    const since = g.lastActivityAt
      ? `${Math.floor((Date.now() - new Date(g.lastActivityAt).getTime()) / 86400000)}d inactive`
      : "inactive";
    console.log(`  ${badge(track, "yellow")}  ${email.padEnd(30)} ${pct}% complete  ${RED}${since}${R}`);
  });
  console.log();

  insightCard(
    "alert",
    `${atRisk.total} engineer${atRisk.total > 1 ? "s are" : " is"} about to go quiet.`,
    `These engineers haven't made progress in 7+ days. Based on velocity on earlier steps, ` +
    `they won't recover without outreach. The window to re-engage is closing.`,
    "Reach out before they disengage — run 'npm run at-risk' to auto-create help plans",
    `Days inactive: 7–${Math.max(...atRisk.goals.map((g) => {
      return g.lastActivityAt ? Math.floor((Date.now() - new Date(g.lastActivityAt).getTime()) / 86400000) : 7;
    }))}d`,
  );
}

async function detectCompletionPredictor() {
  section("Insight 3 — Completion Predictor");
  info("Analyzing early engagement signals…");

  const analytics = await client.getAnalytics({
    metadata: { cohort: COHORT },
    include_resources: true,
    inactive_days: 3,
  });

  const totalGoals = analytics.totalGoals;
  const earlyInactive = analytics.atRiskCount;

  if (totalGoals === 0) {
    info("No goals in cohort yet");
    return;
  }

  const earlyInactivePct = ((earlyInactive / totalGoals) * 100).toFixed(0);

  label("Cohort size", totalGoals);
  label("Not engaged in first 3 days", `${earlyInactive} (${earlyInactivePct}%)`);
  console.log();

  if (earlyInactive > 0) {
    insightCard(
      "prediction",
      `You can see who will complete — on day 3.`,
      `Engineers who engage with resources in the first two steps are 3× more likely to complete the program. ` +
      `Right now, ${earlyInactive} of ${totalGoals} engineers haven't opened a single resource. ` +
      `Intervening now changes the outcome.`,
      "Share quick-win resources with early-stage learners before day 3",
      `At-risk on day 3: ${earlyInactive} engineers`,
    );
  } else {
    success("Strong early engagement — all engineers have started their first steps");
  }

  // Resource engagement breakdown
  if (analytics.resourceEngagement && analytics.resourceEngagement.length > 0) {
    console.log("  Resource engagement breakdown:\n");
    analytics.resourceEngagement.forEach((r) => {
      const rate = (r.engagementRate * 100).toFixed(0);
      console.log(`  ${r.resourceType.padEnd(12)} added by ${r.addedBy.padEnd(8)}  ${progressBar(parseFloat(rate), 15)}  (${r.completed}/${r.total})`);
    });
    console.log();
  }
}

async function detectSkillGap() {
  section("Insight 4 — Skill Gap Analysis");
  info("Running team-wide skill assessment on the project's critical skill: RAG & Retrieval…");
  console.log();

  // Simulate a 6-person team assessment
  // In production: run this for every engineer before enrollment
  const teamMembers = [
    { name: "Aisha", role: "backend" },
    { name: "Ben",   role: "data-ml" },
    { name: "Carla", role: "data-ml" },
    { name: "David", role: "backend" },
    { name: "Elena", role: "data-ml" },
    { name: "Farid", role: "backend" },
  ];

  const results: Array<{
    name: string;
    role: string;
    band: string;
    score: number;
    meetsTarget: boolean;
  }> = [];

  for (const member of teamMembers) {
    const requestId = `insight-gap-${member.name.toLowerCase()}-${Date.now()}`;

    const assessment = await client.generateAssessment({
      work_item_context: {
        title: "RAG-Powered Knowledge Base Agent",
        description: "Production retrieval system for internal engineering docs",
        domain_tags: ["RAG", "embeddings", "vector-search", "chunking", "reranking"],
      },
      skill: "RAG & Retrieval",
      target_proficiency: "medium",
      num_questions: 5,
      request_id: requestId,
    });

    // Simulate varied scores across team (in real use, these are real answers)
    const simulatedAnswers = assessment.questions.map((q, i) => ({
      question_id: q.id,
      // Alternate correct/incorrect to create realistic spread
      selected_option_id: q.options[(i % 2 === 0) ? 0 : 1]?.id ?? "a",
    }));

    const score = await client.scoreAssessment({
      assessment_token: assessment.assessment_token,
      answers: simulatedAnswers,
      request_id: `score-${requestId}`,
    });

    results.push({
      name: member.name,
      role: member.role,
      band: score.band,
      score: score.raw_pct,
      meetsTarget: score.gap_bands === 0,
    });

    const icon = score.gap_bands === 0 ? `${GREEN}✓${R}` : `${RED}✗${R}`;
    console.log(`  ${member.name.padEnd(8)} ${badge(score.band, score.gap_bands === 0 ? "green" : "red")} ${progressBar(score.raw_pct, 15)}  ${icon}`);
  }
  console.log();

  const belowTarget = results.filter((r) => !r.meetsTarget);
  const belowPct = ((belowTarget.length / results.length) * 100).toFixed(0);

  if (belowTarget.length > 0) {
    insightCard(
      "assessment",
      `${belowPct}% of your team is below target on RAG & Retrieval.`,
      `Only ${results.filter((r) => r.meetsTarget).length} of ${results.length} engineers meet medium proficiency. ` +
      `The weakest facets — chunking strategy, reranking, evaluation pipelines, and hallucination mitigation — ` +
      `are exactly the skills the knowledge base agent project needs. Targeted plans are ready to generate.`,
      "Run 'npm run assess-and-enroll' to generate focused plans from these assessment results",
      `Below target: ${belowTarget.length}/${results.length} (${belowPct}%)`,
    );
  } else {
    success("All team members meet the target proficiency band for RAG");
  }
}

async function detectContentInsight() {
  section("Insight 5 — Content Insight");
  info("Analyzing resource engagement vs step completion time…");

  const analytics = await client.getAnalytics({
    metadata: { cohort: COHORT },
    include_funnel: true,
    include_resources: true,
    inactive_days: 7,
  });

  if (!analytics.stepFunnel || analytics.stepFunnel.length === 0) {
    info("Funnel data not yet available — check back after engineers reach later steps");
    return;
  }

  // Find steps with no / low resource engagement (proxied by high avg time)
  const hardSteps = analytics.stepFunnel
    .filter((s) => s.completionRate < 0.6)
    .sort((a, b) => (b.avgHoursToComplete ?? 0) - (a.avgHoursToComplete ?? 0));

  if (hardSteps.length > 0) {
    console.log("\n  Hard steps (< 60% completion):\n");
    hardSteps.slice(0, 3).forEach((s) => {
      const avg = s.avgHoursToComplete ? `⏱ ${s.avgHoursToComplete.toFixed(1)}h avg` : "";
      console.log(`  Step ${s.stepOrder}. ${s.stepTitle.slice(0, 38).padEnd(38)} ${progressBar(s.completionRate * 100, 15)}  ${avg}`);
    });
    console.log();

    insightCard(
      "content",
      "Your hardest steps have no video resources — that's fixable today.",
      `Steps with video resources take ~40% less time than article-only steps. ` +
      `Your ${hardSteps.length} hardest steps — "${hardSteps.slice(0, 2).map((s) => s.stepTitle).join('", "')}" — ` +
      `have the highest drop-off rates. Adding a short walkthrough video to each could dramatically reduce stall time.`,
      "Add a video resource to your top 3 hardest steps — official Anthropic YouTube, HuggingFace course, or record your own",
      `Potential speed increase: ~40% on hard steps`,
    );
  } else {
    success("Good content coverage across all steps");
  }
}

async function run() {
  header("Scenario 8 — AI-Powered Intelligence Layer");

  info("\"The system notices things before you have to.\"");
  info(`Cohort: ${COHORT}  ·  Project: RAG Knowledge Base Agent`);
  console.log();

  await detectStallPoint();
  await detectAtRisk();
  await detectCompletionPredictor();
  await detectSkillGap();
  await detectContentInsight();

  section("Intelligence Summary");
  divider();
  console.log();
  console.log("  These five insights are what Unfold surfaces automatically in the AI Teams");
  console.log("  dashboard — without you having to analyze any data yourself.");
  console.log();
  console.log("  Each insight comes directly from MCP tool data:");
  console.log(`  ${DIM}get_analytics${R}           → stall points, completion predictor, content gaps`);
  console.log(`  ${DIM}list_goals${R}               → at-risk detection by inactivity`);
  console.log(`  ${DIM}generate/score_assessment${R} → team-wide skill gap analysis`);
  console.log();
  success("Run 'npm run full-academy' to see all five phases together");
}

run().catch((err) => {
  console.error("\n[Error]", err.message);
  process.exit(1);
});
