// ─────────────────────────────────────────────────────────────────
// Scenario 2: Batch Role-Based Onboarding
//
// Enroll a four-role engineering team into the AI Academy.
// Each engineer gets a personalized plan based on their role,
// stack, and the actual project they're building — not a
// generic AI syllabus.
//
// PROJECT CONTEXT: "Building a RAG-powered knowledge base agent
// for internal engineering docs"
//
// Roles: Backend · Frontend · DevOps/Platform · Data & ML
//
// Demonstrates:
//   - Role-based plan personalization anchored to a real project
//   - Tier 1 (fully-auto) for most engineers
//   - Tier 2 (semi-auto with review) for a senior engineer
//   - Metadata tagging for cohort-level analytics
//   - Collecting all claim links for distribution
//
// MCP tools used:
//   create_goal (auto_respond=true and false)
//   get_clarification → submit_clarification
// ─────────────────────────────────────────────────────────────────

import "dotenv/config";
import { UnfoldClient } from "../client.js";
import {
  header, section, success, info, warn, label, link,
  goalCard, divider, badge,
} from "../utils/display.js";

const client = new UnfoldClient(
  process.env.UNFOLD_API_KEY!,
  process.env.UNFOLD_API_URL,
);

const COHORT = "spring-2026";
const PROJECT = "RAG-Powered Knowledge Base Agent";
const PROJECT_DESCRIPTION =
  "Build a production retrieval-augmented generation system that indexes internal " +
  "engineering docs and answers developer questions with cited sources. " +
  "Stack: Python, FastAPI, pgvector, Anthropic Claude API.";

// The four engineering roles and what each needs to learn
const roleProfiles = [
  {
    name: "Alex Chen",
    email: "alex@example.com",
    role: "Backend Engineer",
    track: "backend",
    experienceLevel: "low" as const,
    techStack: ["Python", "FastAPI", "PostgreSQL", "pgvector"],
    goalTitle: "Backend Engineer AI Skills — RAG Knowledge Base Project",
    goalDescription:
      "Build the ingestion pipeline, embedding generation, vector search API, " +
      "and LLM orchestration layer for the RAG knowledge base agent. " +
      "Focus: LLM API integration, function calling, streaming, evals, cost control.",
  },
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    role: "Frontend Engineer",
    track: "frontend",
    experienceLevel: "beginner" as const,
    techStack: ["React", "TypeScript", "Next.js"],
    goalTitle: "Frontend Engineer AI Skills — RAG Knowledge Base Project",
    goalDescription:
      "Build the chat interface, streaming response renderer, source citation UI, " +
      "and feedback collection for the RAG agent. " +
      "Focus: AI UX patterns, streaming UI, real-time rendering, error states, user feedback loops.",
  },
  {
    name: "Jordan Rivera",
    email: "jordan@example.com",
    role: "DevOps / Platform Engineer",
    track: "devops",
    experienceLevel: "low" as const,
    techStack: ["Kubernetes", "Terraform", "AWS", "Prometheus"],
    goalTitle: "Platform Engineer AI Skills — RAG Knowledge Base Project",
    goalDescription:
      "Deploy and operate the RAG agent in production. " +
      "Handle model serving, rate limiting, cost budgets, observability, and security hardening. " +
      "Focus: LLM infrastructure, rate limiting, cost control, observability, OWASP LLM Top 10.",
  },
  {
    name: "Sam Okonkwo",
    email: "sam@example.com",
    role: "Data & ML Engineer",
    track: "data-ml",
    experienceLevel: "medium" as const,
    techStack: ["Python", "PyTorch", "HuggingFace", "Pandas"],
    goalTitle: "Data & ML Engineer AI Skills — RAG Knowledge Base Project",
    goalDescription:
      "Own embeddings, chunking strategy, retrieval quality, and evaluation pipelines " +
      "for the RAG knowledge base. " +
      "Focus: embedding models, chunking, vector search optimization, RAG evals, reranking, hallucination mitigation.",
  },
];

// Senior engineer gets semi-auto review (Tier 2)
const seniorEngineer = {
  name: "Maya Patel",
  email: "maya@example.com",
  role: "Staff Engineer (Tech Lead)",
  track: "backend",
  experienceLevel: "high" as const,
  techStack: ["Python", "Go", "Rust", "LangChain", "Anthropic SDK"],
  goalTitle: "Staff Engineer AI Leadership Skills — RAG Knowledge Base Project",
  goalDescription:
    "Lead the technical architecture of the RAG knowledge base agent. " +
    "Design the system for scale, safety, and maintainability. Mentor the team on LLM best practices. " +
    "Focus: system design for LLM apps, advanced evals, safety architecture, team enablement.",
};

async function run() {
  header("Scenario 2 — Batch Role-Based Onboarding");

  info(`Project: ${PROJECT}`);
  info(`Cohort: ${COHORT}  ·  ${roleProfiles.length + 1} engineers  ·  4 roles`);
  console.log();

  // ── Tier 1: Fully autonomous — all four role-specific plans ───────
  section("Tier 1 — Fully Autonomous Enrollment");
  info("Agent answers all clarification questions. Plans anchored to the RAG project context.");
  console.log();

  const tier1Results: Array<{
    profile: typeof roleProfiles[number];
    goalId: string;
    claimLink?: string;
    progressLink?: string | null;
    planStatus: string;
  }> = [];

  for (const profile of roleProfiles) {
    info(`Enrolling ${profile.name} (${profile.role})…`);

    const goal = await client.createGoal({
      title: profile.goalTitle,
      description: profile.goalDescription,
      context: {
        tech_stack: profile.techStack,
        experience_level: profile.experienceLevel,
        timeline: "8 weeks",
        success_criteria: `Contribute to the ${PROJECT} — implement role-specific components with production quality`,
        additional_notes: `Project: ${PROJECT_DESCRIPTION}`,
      },
      auto_respond: true,
      goal_context: "professional",
      priority: profile.experienceLevel === "beginner" ? "high" : "medium",
      claim_expires_in_days: 21,
      progress_share: true,
      metadata: {
        cohort: COHORT,
        track: profile.track,
        role: profile.role,
        project: "rag-knowledge-base",
        experience_level: profile.experienceLevel,
        learner_email: profile.email,
      },
    });

    tier1Results.push({
      profile,
      goalId: goal.goalId,
      claimLink: goal.claimLink,
      progressLink: goal.progressLink,
      planStatus: goal.planGenerationStatus,
    });

    success(`${profile.name} — ${badge(profile.track, "cyan")} enrolled`);
  }

  // ── Tier 1 results ────────────────────────────────────────────────
  section("Tier 1 Claim Links");
  for (const r of tier1Results) {
    goalCard({
      title: `${r.profile.name}  ·  ${r.profile.role}`,
      goalId: r.goalId,
      claimLink: r.claimLink,
      progressLink: r.progressLink,
      planGenerationStatus: r.planStatus,
      metadata: { track: r.profile.track, cohort: COHORT },
    });
  }

  // ── Tier 2: Semi-auto — staff engineer with review ─────────────────
  section("Tier 2 — Semi-Auto (Staff Engineer with Coordinator Review)");
  info("Agent suggests clarification answers. Coordinator reviews before plan generates.");
  info(`Enrolling ${seniorEngineer.name} (${seniorEngineer.role})…`);
  console.log();

  const seniorGoal = await client.createGoal({
    title: seniorEngineer.goalTitle,
    description: seniorEngineer.goalDescription,
    context: {
      tech_stack: seniorEngineer.techStack,
      experience_level: seniorEngineer.experienceLevel,
      timeline: "4 weeks",
      success_criteria: `Lead the ${PROJECT} to production — architecture sign-off, team unblocking, quality bar`,
      additional_notes: `Project: ${PROJECT_DESCRIPTION}. Senior IC — needs depth not breadth.`,
    },
    auto_respond: false,   // ← get questions + agent suggestions for review
    goal_context: "professional",
    priority: "high",
    claim_expires_in_days: 14,
    progress_share: true,
    metadata: {
      cohort: COHORT,
      track: seniorEngineer.track,
      role: seniorEngineer.role,
      project: "rag-knowledge-base",
      experience_level: seniorEngineer.experienceLevel,
      learner_email: seniorEngineer.email,
      review_required: "true",
    },
  });

  if (seniorGoal.questions && seniorGoal.questions.length > 0) {
    success(`${seniorGoal.questions.length} clarification questions returned with agent suggestions`);
    console.log();

    seniorGoal.questions.forEach((q, i) => {
      console.log(`  ${i + 1}. ${q.text}`);
      if (q.agentAnswer) {
        console.log(`     ${badge("agent suggests", "cyan")} "${q.agentAnswer}"  (${q.agentConfidence ?? "–"} confidence)`);
      }
      if (q.defaultAssumption && !q.agentAnswer) {
        console.log(`     ${badge("default", "yellow")} "${q.defaultAssumption}"`);
      }
      console.log();
    });

    section("Submitting — Coordinator Accepts Agent Suggestions");

    const submitted = await client.submitClarification(seniorGoal.goalId, {
      accept_agent_answers: true,
    });

    success(`Plan generation triggered for ${seniorEngineer.name}`);
    label("Goal ID", submitted.goalId);
    label("Plan status", submitted.planGenerationStatus);
    if (submitted.agentAnswersUsed) {
      label("Agent answers used", submitted.agentAnswersUsed.length);
    }
  } else {
    // Fully resolved with no open questions
    success(`${seniorEngineer.name} auto-enrolled (no open questions)`);
    goalCard({
      title: `${seniorEngineer.name}  ·  ${seniorEngineer.role}`,
      goalId: seniorGoal.goalId,
      claimLink: seniorGoal.claimLink,
      progressLink: seniorGoal.progressLink,
      planGenerationStatus: seniorGoal.planGenerationStatus,
      metadata: { track: seniorEngineer.track, cohort: COHORT },
    });
  }

  // ── Summary ───────────────────────────────────────────────────────
  section("Enrollment Summary");
  divider();

  console.log(`\n  Project:    ${PROJECT}`);
  console.log(`  Cohort:     ${COHORT}`);
  console.log(`  Enrolled:   ${tier1Results.length + 1} engineers`);
  console.log(`  Tracks:     ${[...new Set(roleProfiles.map((p) => p.track))].join("  ·  ")}`);
  console.log();

  success("Claim links ready to send via email or Slack");
  info("Plans generate async (15–30s). Poll with get_goal_status until planGenerationStatus = 'completed'");
  warn("Tag goals with metadata to unlock analytics by role, cohort, and project");
  console.log();
  info("Next: run 'npm run analytics' after engineers claim their goals to see cohort progress");
}

run().catch((err) => {
  console.error("\n[Error]", err.message);
  process.exit(1);
});
