// ─────────────────────────────────────────────────────────────────
// Scenario 9: Platform Integration
//
// "Drop Unfold into your stack in an afternoon."
//
// Shows how an existing engineering portal (LMS, HR system,
// internal tooling) integrates with Unfold as a backend service.
//
// Your portal stays yours. Unfold handles plans, learning, and
// analytics. One MCP call to enroll. Live progress back on both sides.
//
// Integration flow:
//   Your portal → generate_skill_assessment + create_goal → claim link
//   Your portal → email/Slack → engineer clicks → lands on Unfold
//   Your portal ← get_goal_status / get_analytics ← engineer learns
//
// This scenario simulates that portal — it's the code you'd write
// in your own backend to integrate Unfold as a learning service.
//
// MCP tools used:
//   generate_skill_assessment → score_skill_assessment
//   → create_goal → get_goal_status → get_analytics
// ─────────────────────────────────────────────────────────────────

import "dotenv/config";
import { UnfoldClient } from "../client.js";
import {
  header, section, success, info, warn, label, link,
  divider, progressBar, badge,
} from "../utils/display.js";

const client = new UnfoldClient(
  process.env.UNFOLD_API_KEY!,
  process.env.UNFOLD_API_URL,
);

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const R = "\x1b[0m";

// ── Simulated "your portal" types ─────────────────────────────────

interface PortalEngineer {
  id: string;
  name: string;
  email: string;
  role: "backend" | "frontend" | "devops" | "data-ml";
  techStack: string[];
  department: string;
  managedBy: string;
}

interface PortalEnrollmentResult {
  engineerId: string;
  unfoldGoalId: string;
  claimLink: string;
  progressLink: string | null;
  assessedBand: string;
  assessmentScore: number;
  enrolledAt: string;
}

// ── Your portal's engineer roster ─────────────────────────────────

const engineers: PortalEngineer[] = [
  {
    id: "eng-001",
    name: "Alice Kim",
    email: "alice@yourcompany.com",
    role: "backend",
    techStack: ["Python", "FastAPI", "PostgreSQL"],
    department: "Platform",
    managedBy: "eng-mgr-01",
  },
  {
    id: "eng-002",
    name: "Bob Martinez",
    email: "bob@yourcompany.com",
    role: "frontend",
    techStack: ["React", "TypeScript"],
    department: "Product",
    managedBy: "eng-mgr-02",
  },
];

// ── Integration functions (your portal's service layer) ───────────

/**
 * STEP 1 — Assess & Enroll
 * Call this from your portal's onboarding flow or new-hire script.
 * Returns the claim link to put in your welcome email.
 */
async function assessAndEnroll(
  engineer: PortalEngineer,
  projectContext: { title: string; description: string; targetSkill: string },
): Promise<PortalEnrollmentResult> {

  // 1a. Generate a skill assessment anchored to the real project
  const requestId = `portal-${engineer.id}-${Date.now()}`;

  const assessment = await client.generateAssessment({
    work_item_context: {
      title: projectContext.title,
      description: projectContext.description,
      domain_tags: [engineer.role, ...engineer.techStack.slice(0, 2)],
    },
    skill: projectContext.targetSkill,
    target_proficiency: "medium",
    num_questions: 6,
    request_id: requestId,
  });

  // 1b. In your real portal: show the assessment in your UI and collect answers.
  // Here we simulate a mid-level response (mix of right/wrong).
  const answers = assessment.questions.map((q, i) => ({
    question_id: q.id,
    selected_option_id: q.options[i % 2 === 0 ? 0 : 1]?.id ?? "a",
  }));

  const score = await client.scoreAssessment({
    assessment_token: assessment.assessment_token,
    answers,
    request_id: `score-${requestId}`,
  });

  // 1c. Use assessment results to create a targeted learning goal
  const goalTitle = score.suggested_goal_seed?.title
    ?? `${projectContext.targetSkill} Learning Path — ${engineer.name}`;
  const goalDescription = score.suggested_goal_seed?.summary
    ?? `Targeted learning plan to close the gap to medium proficiency in ${projectContext.targetSkill}`;

  const goal = await client.createGoal({
    title: goalTitle,
    description: goalDescription,
    context: {
      tech_stack: engineer.techStack,
      experience_level: score.band,                // measured band, not assumed
      timeline: "6 weeks",
      success_criteria: `Reach medium proficiency in ${projectContext.targetSkill} and contribute to ${projectContext.title}`,
      additional_notes:
        `Assessment: ${score.raw_pct.toFixed(0)}% (${score.band} band, gap: ${score.gap_bands}). ` +
        `Enrolled via ${engineer.department} portal.`,
    },
    auto_respond: true,
    goal_context: "professional",
    priority: score.gap_bands >= 2 ? "high" : "medium",
    claim_expires_in_days: 14,
    progress_share: true,
    metadata: {
      // Your portal's metadata — drives analytics segmentation
      portal_engineer_id: engineer.id,
      department: engineer.department,
      managed_by: engineer.managedBy,
      cohort: "spring-2026",
      track: engineer.role,
      project: "rag-knowledge-base",
      assessed_band: score.band,
      assessment_score: score.raw_pct.toFixed(0),
      learner_email: engineer.email,
    },
  });

  return {
    engineerId: engineer.id,
    unfoldGoalId: goal.goalId,
    claimLink: goal.claimLink ?? "",
    progressLink: goal.progressLink ?? null,
    assessedBand: score.band,
    assessmentScore: score.raw_pct,
    enrolledAt: new Date().toISOString(),
  };
}

/**
 * STEP 2 — Check progress for a single engineer
 * Call this from your portal's engineer profile page.
 */
async function getEngineerProgress(goalId: string) {
  return client.getGoalStatus(goalId);
}

/**
 * STEP 3 — Cohort dashboard data for your portal
 * Call this from your L&D or engineering manager dashboard.
 */
async function getCohortDashboard(cohort: string, department?: string) {
  const metadata: Record<string, string> = { cohort };
  if (department) metadata.department = department;

  const [overall, byTrack] = await Promise.all([
    client.getAnalytics({
      metadata,
      inactive_days: 7,
      include_funnel: true,
    }),
    client.getAnalytics({
      metadata,
      group_by: "track",
      include_funnel: false,
    }),
  ]);

  return { overall, byTrack };
}

// ── Main demo ─────────────────────────────────────────────────────

async function run() {
  header("Scenario 9 — Platform Integration");

  info(`"Drop Unfold into your stack in an afternoon."`);
  info("Simulates how your existing portal calls Unfold as a learning service.");
  console.log();

  // ── Step 1: Enroll from your portal ───────────────────────────────
  section("Step 1 — Enroll Engineers from Your Portal");

  const projectContext = {
    title: "RAG Knowledge Base Agent",
    description:
      "Build a production retrieval-augmented generation system for internal engineering docs. " +
      "Stack: Python, FastAPI, pgvector, Anthropic Claude.",
    targetSkill: "LLM API Integration",
  };

  info(`Project: ${projectContext.title}`);
  info(`Enrolling ${engineers.length} engineers via portal API…`);
  console.log();

  const enrollmentRecords: PortalEnrollmentResult[] = [];

  for (const engineer of engineers) {
    info(`Assessing + enrolling ${engineer.name} (${engineer.role} / ${engineer.department})…`);

    const result = await assessAndEnroll(engineer, projectContext);
    enrollmentRecords.push(result);

    success(`${engineer.name} enrolled`);
    label("  Assessed band", result.assessedBand);
    label("  Score", `${result.assessmentScore.toFixed(0)}%`);
    label("  Unfold Goal ID", result.unfoldGoalId);
    link("  Claim link (→ welcome email)", result.claimLink);
    if (result.progressLink) link("  Progress embed link", result.progressLink);
    console.log();
  }

  // ── Step 2: Portal shows "send claim links" action ────────────────
  section("Step 2 — Distribute via Your Existing Comms");

  divider();
  console.log();
  console.log(`  ${BOLD}Your portal now has everything it needs to send welcome emails:${R}`);
  console.log();

  for (const r of enrollmentRecords) {
    const eng = engineers.find((e) => e.id === r.engineerId)!;
    console.log(`  To: ${eng.email}`);
    console.log(`  Subject: Your AI learning path is ready`);
    console.log(`  ${DIM}Body: Hi ${eng.name.split(" ")[0]}, your personalized AI learning plan`);
    console.log(`  for the RAG Knowledge Base project is ready. Click to start:${R}`);
    console.log(`  ${CYAN}${r.claimLink}${R}`);
    console.log();
  }

  info("Works anywhere: email, Slack, your onboarding portal, GitHub Actions, etc.");
  console.log();

  // ── Step 3: Check live progress from your portal ──────────────────
  section("Step 3 — Check Live Progress (Your Portal's Profile Page)");

  info("Polling get_goal_status for each enrolled engineer…");
  console.log();

  for (const r of enrollmentRecords) {
    const eng = engineers.find((e) => e.id === r.engineerId)!;

    try {
      const status = await getEngineerProgress(r.unfoldGoalId);
      const pct = status.progress.overallPercent;
      const stepsDone = status.progress.completedSteps;
      const stepsTotal = status.progress.totalSteps;

      console.log(`  ${BOLD}${eng.name}${R} (${eng.role})`);
      console.log(`  ${progressBar(pct, 25)}  ${stepsDone}/${stepsTotal} steps`);
      label("  Status", status.status);
      label("  Plan", status.planGenerationStatus);
      if (status.progressLink) link("  Embed in your portal", status.progressLink);
      console.log();
    } catch {
      // Plan may still be generating — expected right after creation
      info(`  ${eng.name}: plan generating (planGenerationStatus updates in ~30s)`);
      console.log();
    }
  }

  // ── Step 4: Cohort dashboard for the L&D manager ──────────────────
  section("Step 4 — Cohort Dashboard (Your L&D Portal View)");

  info("Calling get_analytics — this powers your portal's management dashboard…");

  const dashboard = await getCohortDashboard("spring-2026", "Platform");

  divider();
  console.log(`\n  ${BOLD}Cohort: spring-2026  ·  Department: Platform${R}\n`);

  label("Total enrolled", dashboard.overall.totalGoals);
  label("Active", dashboard.overall.activeGoals);
  label("Completed", dashboard.overall.completedGoals);
  label("At risk (7d inactive)", dashboard.overall.atRiskCount);

  const completionPct = dashboard.overall.completionRate * 100;
  console.log(`\n  Completion rate:  ${progressBar(completionPct)}`);

  if (dashboard.byTrack.completionByDimension && dashboard.byTrack.completionByDimension.length > 0) {
    console.log("\n  By track:\n");
    dashboard.byTrack.completionByDimension.forEach((d) => {
      console.log(`  ${d.dimension.padEnd(15)} ${progressBar(d.completionRate * 100, 20)}  (${d.completed}/${d.total})`);
    });
  }
  console.log();

  // ── Step 5: Show what flows where ─────────────────────────────────
  section("Step 5 — Data Flow Summary");

  divider();
  console.log(`
  ${BOLD}Your Portal${R}                           ${BOLD}Unfold${R}
  ────────────────                       ─────────────────────────────
  Roster / onboarding   →  generate_skill_assessment + create_goal
  Welcome email         ←  claim link returned
  Engineer clicks link  →  auto-joins org, plan ready to execute
  Profile page          ←  get_goal_status (live progress)
  L&D dashboard         ←  get_analytics (cohort KPIs, funnel, at-risk)
  At-risk job           →  list_goals (inactive_days=7) + create_goal
  `);

  console.log(`  ${DIM}Option A:${R} Embed ${CYAN}progressLink${R} in your portal — no extra code needed`);
  console.log(`  ${DIM}Option B:${R} Call ${CYAN}get_analytics${R} to build your own dashboard widgets`);
  console.log();

  success("Integration complete — your portal is now AI-learning-enabled");
  info("See configs/claude-desktop-config.json to set this up with Claude Desktop or Cursor");
}

run().catch((err) => {
  console.error("\n[Error]", err.message);
  process.exit(1);
});
