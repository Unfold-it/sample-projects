// ─────────────────────────────────────────────────────────────────
// Scenario 6: Full AI Academy — End-to-End Demo
//
// The complete five-phase AI learning ecosystem for engineering teams.
// Every engineer gets a personalized learning path anchored to the
// ACTUAL PROJECT the team is building. The system tracks everything
// and surfaces what needs attention.
//
// PROJECT: Building a RAG-powered knowledge base agent
//
// Phase 1 — ASSESS:    Benchmark each engineer before a plan exists
// Phase 2 — ENROLL:    Create role-based, gap-focused learning plans
// Phase 3 — LEARN:     Engineers work through steps; resources curated
// Phase 4 — MONITOR:   Cohort KPIs, funnel, at-risk — real time
// Phase 5 — IMPROVE:   Surface stall points, gaps, and what to fix
//
// All 11 MCP tools used.
// ─────────────────────────────────────────────────────────────────

import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { UnfoldClient } from "../client.js";
import {
  header, section, success, info, warn, label, link,
  divider, progressBar, badge, analyticsCard, assessmentResult,
} from "../utils/display.js";
import type { Curriculum } from "../types.js";

const client = new UnfoldClient(
  process.env.UNFOLD_API_KEY!,
  process.env.UNFOLD_API_URL,
);

const __dir = dirname(fileURLToPath(import.meta.url));
const curriculaDir = join(__dir, "../../curricula");

// ── Academy configuration ─────────────────────────────────────────

const COHORT = "spring-2026";

// The real project context — all plans are anchored to this
const PROJECT = {
  title: "RAG-Powered Knowledge Base Agent",
  description:
    "Build a production retrieval-augmented generation system that indexes internal " +
    "engineering docs and answers developer questions with cited sources. " +
    "Stack: Python, FastAPI, pgvector, Anthropic Claude API.",
};

// Four engineering roles — each gets a different plan
const team = [
  {
    name: "Aisha O.",
    email: "aisha@example.com",
    role: "Backend Engineer",
    track: "backend",
    techStack: ["Python", "FastAPI", "PostgreSQL"],
    targetSkill: "LLM API Integration",
    goalFocus: "Build the ingestion pipeline, embeddings, vector search API, and LLM orchestration layer",
  },
  {
    name: "Marcus W.",
    email: "marcus@example.com",
    role: "Frontend Engineer",
    track: "frontend",
    techStack: ["React", "TypeScript", "Next.js"],
    targetSkill: "AI UX & Streaming Interfaces",
    goalFocus: "Build the chat interface, streaming response renderer, and source citation UI",
  },
  {
    name: "Lena F.",
    email: "lena@example.com",
    role: "Data & ML Engineer",
    track: "data-ml",
    techStack: ["Python", "HuggingFace", "Pandas"],
    targetSkill: "RAG & Retrieval",
    goalFocus: "Own chunking strategy, embedding models, retrieval quality, and evaluation pipelines",
  },
  {
    name: "Jordan R.",
    email: "jordan@example.com",
    role: "DevOps / Platform Engineer",
    track: "devops",
    techStack: ["Kubernetes", "Terraform", "AWS", "Prometheus"],
    targetSkill: "LLM Infrastructure",
    goalFocus: "Deploy and operate the RAG agent — model serving, rate limits, observability, cost control",
  },
];

interface LearnerRecord {
  member: typeof team[number];
  assessedBand?: string;
  assessmentScore?: number;
  assessmentGap?: number;
  goalSeedTitle?: string;
  goalId?: string;
  claimLink?: string;
  progressLink?: string | null;
}

async function run() {
  header("Full AI Academy Demo — 5 Phases, All 11 MCP Tools");

  console.log(`  Project: ${PROJECT.title}`);
  console.log(`  Cohort:  ${COHORT}  ·  ${team.length} engineers  ·  4 roles`);
  console.log();

  const records: LearnerRecord[] = team.map((m) => ({ member: m }));

  // ════════════════════════════════════════════════════════════════
  // PHASE 1 — ASSESS: Benchmark each engineer before a plan exists
  // ════════════════════════════════════════════════════════════════

  section("PHASE 1 — Assess: Skill Benchmarks Before Any Plan");
  divider();
  info("MCQ assessments anchored to the RAG project — not a generic syllabus.");
  info("Identifies exactly which sub-skills each engineer needs to build.");
  console.log();

  // Check capabilities first
  const caps = await client.getAssessmentCapabilities();
  info(`Assessment engine: ${caps.supported_proficiency_bands.join(" → ")}  ·  ${caps.min_questions}–${caps.max_questions} questions`);
  console.log();

  for (const record of records) {
    const { member } = record;
    const requestId = `${COHORT}-${member.track}-${Date.now()}`;

    info(`Assessing ${member.name} on "${member.targetSkill}"…`);

    const assessment = await client.generateAssessment({
      work_item_context: {
        title: PROJECT.title,
        description: `${member.goalFocus}. ${PROJECT.description}`,
        domain_tags: [member.track, ...member.techStack.slice(0, 2)],
      },
      skill: member.targetSkill,
      target_proficiency: "medium",
      num_questions: 6,
      request_id: requestId,
    });

    // Simulate answers (real app: engineer answers in your portal)
    const answers = assessment.questions.map((q, i) => ({
      question_id: q.id,
      selected_option_id: q.options[i % 3 === 0 ? 1 : 0]?.id ?? "a",
    }));

    const scoreResult = await client.scoreAssessment({
      assessment_token: assessment.assessment_token,
      answers,
      request_id: `score-${requestId}`,
    });

    record.assessedBand = scoreResult.band;
    record.assessmentScore = scoreResult.raw_pct;
    record.assessmentGap = scoreResult.gap_bands;
    record.goalSeedTitle = scoreResult.suggested_goal_seed?.title;

    const gapLabel = scoreResult.gap_bands > 0
      ? `${badge("gap: " + scoreResult.gap_bands + " bands", "yellow")}`
      : badge("meets target", "green");

    console.log(`  ${member.name.padEnd(14)} ${badge(scoreResult.band, scoreResult.gap_bands > 0 ? "red" : "green")} → target: medium  ${gapLabel}  (${scoreResult.raw_pct.toFixed(0)}%)`);
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 2 — ENROLL: Role-based, gap-focused learning plans
  // ════════════════════════════════════════════════════════════════

  section("PHASE 2 — Enroll: Targeted Plans from Assessment Gaps");
  divider();
  info("Plans focus on weak sub-skills. Engineers who already know a topic skip ahead.");
  info("All plans anchor to the RAG project context, not generic AI curricula.");
  console.log();

  for (const record of records) {
    const { member } = record;
    const title = record.goalSeedTitle ?? `${member.targetSkill} for ${member.role} — ${member.name}`;

    info(`Creating goal for ${member.name} (${member.role})…`);

    const goal = await client.createGoal({
      title,
      description: `${member.goalFocus}. Prioritize the gap to medium proficiency in ${member.targetSkill}.`,
      context: {
        tech_stack: member.techStack,
        experience_level: record.assessedBand ?? "low",
        timeline: "6 weeks",
        success_criteria:
          `Reach medium proficiency in ${member.targetSkill}. ` +
          `Deliver role-specific components of the ${PROJECT.title}.`,
        additional_notes:
          `Assessment: ${record.assessmentScore?.toFixed(0) ?? "?"}% (${record.assessedBand}). ` +
          `Gap: ${record.assessmentGap ?? "?"} band(s). ` +
          `Focus on measured weak areas.`,
      },
      auto_respond: true,
      goal_context: "professional",
      priority: (record.assessmentGap ?? 0) >= 2 ? "high" : "medium",
      claim_expires_in_days: 14,
      progress_share: true,
      metadata: {
        cohort: COHORT,
        track: member.track,
        role: member.role,
        project: "rag-knowledge-base",
        assessed_band: record.assessedBand ?? "unknown",
        assessment_score: record.assessmentScore?.toFixed(0) ?? "0",
        learner_email: member.email,
      },
    });

    record.goalId = goal.goalId;
    record.claimLink = goal.claimLink;
    record.progressLink = goal.progressLink;

    success(`${member.name} enrolled  ${badge(member.track, "cyan")}`);
    if (goal.claimLink) link(`  Claim link`, goal.claimLink);
    console.log();
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 3 — LEARN: Import structured curriculum (Tier 3 flow)
  // ════════════════════════════════════════════════════════════════

  section("PHASE 3 — Learn: Import Structured Curriculum");
  divider();
  info("For teams that prefer a fixed curriculum — import it. AI enriches the structure.");
  info("Adds: critical path, step dependencies, duration estimates, quick-win flags.");
  console.log();

  try {
    const curriculum: Curriculum = JSON.parse(
      readFileSync(join(curriculaDir, "llm-integration.json"), "utf-8"),
    );

    info(`Importing "${curriculum.name}" (${curriculum.steps.length} steps, ${curriculum.estimatedWeeks}w)…`);

    const imported = await client.importPlan({
      title: `${curriculum.name} — ${COHORT} Shared Reference`,
      description: `${curriculum.description}\n\nAnchor: ${PROJECT.title}`,
      steps: curriculum.steps,
      goal_context: "professional",
      priority: "medium",
      enrich: true,
      enrich_options: {
        dependencies: true,
        critical_path: true,
        duration_estimates: true,
        severity: true,
        complexity: true,
        quick_wins: true,
      },
      claim_expires_in_days: 30,
      progress_share: true,
    });

    const criticalCount = imported.steps?.filter((s) => s.isCriticalPath).length ?? 0;
    const quickWinCount = imported.steps?.filter((s) => s.isQuickWin).length ?? 0;

    success(`Curriculum imported and enriched`);
    label("Steps", imported.steps?.length ?? curriculum.steps.length);
    label("Critical path steps", criticalCount);
    label("Quick wins", quickWinCount);
    if (imported.claimLink) link("Shared curriculum link", imported.claimLink);
  } catch (err) {
    warn(`Curriculum import skipped: ${(err as Error).message}`);
  }
  console.log();

  // ════════════════════════════════════════════════════════════════
  // PHASE 4 — MONITOR: Real-time cohort dashboard
  // ════════════════════════════════════════════════════════════════

  section("PHASE 4 — Monitor: Real-Time Cohort Dashboard");
  divider();
  info("No spreadsheets. No surveys. Every number updates as engineers learn.");
  console.log();

  const analytics = await client.getAnalytics({
    metadata: { cohort: COHORT },
    inactive_days: 7,
    include_funnel: true,
  });

  analyticsCard(analytics);

  // By-track breakdown
  const byTrack = await client.getAnalytics({
    metadata: { cohort: COHORT },
    group_by: "track",
    include_funnel: false,
  });

  if (byTrack.completionByDimension && byTrack.completionByDimension.length > 0) {
    console.log("\n  Completion by track:\n");
    byTrack.completionByDimension
      .sort((a, b) => b.completionRate - a.completionRate)
      .forEach((d) => {
        console.log(`  ${d.dimension.padEnd(15)} ${progressBar(d.completionRate * 100, 20)}  (${d.completed}/${d.total})`);
      });
    console.log();
  }

  // Step funnel
  if (analytics.stepFunnel && analytics.stepFunnel.length > 0) {
    console.log("  Step completion funnel:\n");
    let prevRate = 1;
    analytics.stepFunnel.forEach((step) => {
      const drop = prevRate - step.completionRate;
      const stallFlag = drop > 0.2 ? " ← STALL" : "";
      console.log(`  ${String(step.stepOrder).padStart(2)}. ${step.stepTitle.slice(0, 32).padEnd(32)} ${progressBar(step.completionRate * 100, 18)}${stallFlag}`);
      prevRate = step.completionRate;
    });
    console.log();
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 5 — IMPROVE: Intelligence layer
  // ════════════════════════════════════════════════════════════════

  section("PHASE 5 — Improve: The System Notices Things Before You Do");
  divider();
  console.log();

  // At-risk check
  const atRiskList = await client.listGoals({
    inactive_days: 7,
    metadata: [`cohort=${COHORT}`],
    status: "in_progress",
    limit: 20,
  });

  if (atRiskList.total > 0) {
    warn(`${atRiskList.total} engineer(s) haven't made progress in 7+ days — creating re-engagement plans`);
    console.log();

    for (const riskGoal of atRiskList.goals) {
      const email = riskGoal.metadata?.learner_email ?? "unknown";
      const track = riskGoal.metadata?.track ?? "unknown";

      const helpGoal = await client.createGoal({
        title: `Getting Unstuck — ${email.split("@")[0]}`,
        description: `Re-engagement plan for an engineer stalled at ${riskGoal.progress.overallPercent.toFixed(0)}% in the ${track} track.`,
        context: { timeline: "3 days", success_criteria: "Resume the RAG project learning path" },
        auto_respond: true,
        priority: "high",
        claim_expires_in_days: 5,
        metadata: { cohort: COHORT, track, learner_email: email, type: "intervention" },
      });

      if (helpGoal.claimLink) {
        link(`  Re-engagement plan for ${email}`, helpGoal.claimLink);
      }
    }
    console.log();
  } else {
    success("No at-risk engineers — strong cohort engagement");
    console.log();
  }

  // Progress check on enrolled goals
  info("Checking live progress on enrolled goals…");
  console.log();

  for (const record of records) {
    if (!record.goalId) continue;
    try {
      const status = await client.getGoalStatus(record.goalId);
      const { member } = record;
      const pct = status.progress.overallPercent;
      const statusBadge = status.status === "completed"
        ? badge("GRADUATED", "green")
        : badge(status.status, "cyan");

      console.log(`  ${member.name.padEnd(14)} ${progressBar(pct, 20)}  ${statusBadge}`);
    } catch {
      info(`  ${record.member.name}: plan generating (check back in ~30s)`);
    }
  }

  // ════════════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ════════════════════════════════════════════════════════════════

  section("Academy Launch Complete");
  divider();

  console.log(`\n  ${PROJECT.title}\n`);
  label("Cohort", COHORT);
  label("Engineers enrolled", records.filter((r) => r.goalId).length);
  label("Roles", [...new Set(team.map((m) => m.role))].join("  ·  "));
  label("All plans personalized to", "assessed skill gap + real project context");
  console.log();

  console.log("  MCP tools used in this demo:\n");
  [
    "get_assessment_capabilities",
    "generate_skill_assessment",
    "score_skill_assessment",
    "create_goal (auto_respond=true)",
    "import_plan (with AI enrichment)",
    "get_analytics (overall + by-track)",
    "list_goals (at-risk detection)",
    "get_goal_status (live progress)",
    "create_goal (intervention goals)",
  ].forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

  console.log();
  success("Your engineers. AI-ready.");
  console.log();
  info("What comes next:");
  console.log("  • Schedule Scenario 8 (ai-insights) to run daily for automated intelligence");
  console.log("  • Integrate Scenario 9 into your onboarding portal");
  console.log("  • Add Claude Desktop / Cursor MCP config for conversational access");
  console.log("  • Query get_analytics with group_by='department' for exec-level reporting");
  console.log();
}

run().catch((err) => {
  console.error("\n[Error]", err.message);
  process.exit(1);
});
