// ─────────────────────────────────────────────────────────────────
// Scenario 1: Assess & Enroll
//
// The smart intake flow for a new developer joining the AI Academy:
//  1. Check what assessment types are available
//  2. Generate a skill assessment to benchmark their current level
//  3. Simulate the developer answering the questions
//  4. Score the assessment — determine the proficiency gap
//  5. Use the suggested_goal_seed to auto-create a personalized learning goal
//  6. Send the claim link to the developer
//
// MCP tools used:
//   get_assessment_capabilities → generate_skill_assessment
//   → score_skill_assessment → create_goal
// ─────────────────────────────────────────────────────────────────

import "dotenv/config";
import { UnfoldClient } from "../client.js";
import {
  header, section, success, info, warn, label, link,
  assessmentResult, goalCard, divider,
} from "../utils/display.js";

const client = new UnfoldClient(
  process.env.UNFOLD_API_KEY!,
  process.env.UNFOLD_API_URL,
);

// The developer we're onboarding
const developer = {
  name: "Priya Sharma",
  email: "priya@example.com",
  currentRole: "Senior Backend Engineer",
  targetSkill: "LLM Integration" as const,
  targetProficiency: "medium" as const,
  techStack: ["Python", "FastAPI", "PostgreSQL"],
  timeline: "3 months",
};

async function run() {
  header("Scenario 1 — Assess & Enroll");

  info(`Developer: ${developer.name} (${developer.currentRole})`);
  info(`Target skill: ${developer.targetSkill} → proficiency: ${developer.targetProficiency}`);

  // ── Step 1: Check assessment capabilities ─────────────────────────
  section("Step 1: Query Assessment Capabilities");

  const capabilities = await client.getAssessmentCapabilities();

  label("Schema version", capabilities.schema_version);
  label("Supported proficiency bands", capabilities.supported_proficiency_bands.join(", "));
  label("Question range", `${capabilities.min_questions} – ${capabilities.max_questions}`);
  label("Open-domain assessment", String(capabilities.open_domain));
  label("Token TTL", `${capabilities.token_ttl_seconds}s`);

  success("Assessment engine ready");

  // ── Step 2: Generate skill assessment ─────────────────────────────
  section("Step 2: Generate Skill Assessment");

  info(`Generating ${developer.targetSkill} assessment (target: ${developer.targetProficiency})…`);

  const requestId = `assess-${developer.email}-${Date.now()}`;

  const assessment = await client.generateAssessment({
    work_item_context: {
      title: `${developer.targetSkill} Learning Path for ${developer.currentRole}`,
      description: `Assess practical skills for integrating LLMs into Python/FastAPI services. Focus on API usage patterns, prompt design, streaming, error handling, and production readiness.`,
      domain_tags: ["LLM", "Python", "API", "backend", "production"],
    },
    skill: developer.targetSkill,
    target_proficiency: developer.targetProficiency,
    num_questions: 8,
    difficulty_mix: { easy: 0.25, medium: 0.50, hard: 0.25 },
    request_id: requestId,
  });

  success(`Assessment generated — ${assessment.questions.length} questions`);
  label("Model", `${assessment.model_meta.provider} / ${assessment.model_meta.model_id}`);
  label("Max score", assessment.max_raw_score);
  label("Target band", assessment.target_band);

  // ── Step 3: Display questions (developer UI would show these) ─────
  section("Step 3: Assessment Questions (would display in your UI)");

  assessment.questions.forEach((q, i) => {
    console.log(`\n  ${i + 1}. [${q.difficulty}] ${q.stem}`);
    q.options.forEach((opt) => {
      console.log(`     (${opt.id}) ${opt.text}`);
    });
    if (q.skill_facet) console.log(`     Facet: ${q.skill_facet}`);
  });

  // ── Step 4: Simulate developer answers ────────────────────────────
  // In a real app, the developer answers in your UI.
  // Here we simulate a "medium-skill" developer: correct on easy/medium, wrong on hard.
  section("Step 4: Score Assessment (simulated developer answers)");

  const simulatedAnswers = assessment.questions.map((q) => ({
    question_id: q.id,
    // Pick option A for all — real app uses actual learner selections
    selected_option_id: q.options[0]?.id ?? "a",
  }));

  const scoreResult = await client.scoreAssessment({
    assessment_token: assessment.assessment_token,
    answers: simulatedAnswers,
    request_id: `score-${requestId}`,
  });

  assessmentResult(scoreResult);

  // ── Step 5: Create personalized learning goal ──────────────────────
  section("Step 5: Create Personalized Learning Goal");

  const goalSeed = scoreResult.suggested_goal_seed;
  const goalTitle = goalSeed?.title ?? `${developer.targetSkill} Mastery for ${developer.name}`;
  const goalSummary = goalSeed?.summary ?? `Build production-grade ${developer.targetSkill} skills`;

  info(`Creating goal: "${goalTitle}"`);

  const goal = await client.createGoal({
    title: goalTitle,
    description: goalSummary,
    context: {
      tech_stack: developer.techStack,
      timeline: developer.timeline,
      experience_level: scoreResult.band,         // current assessed level
      success_criteria: `Reach ${developer.targetProficiency} proficiency in ${developer.targetSkill}`,
      additional_notes: `Current assessment score: ${scoreResult.raw_pct.toFixed(0)}% (${scoreResult.band} band). Gap: ${scoreResult.gap_bands} band(s) to target.`,
    },
    auto_respond: true,
    goal_context: "professional",
    priority: scoreResult.gap_bands >= 2 ? "high" : "medium",
    claim_expires_in_days: 14,
    progress_share: true,
    metadata: {
      learner_email: developer.email,
      cohort: "spring-2026",
      track: "llm-integration",
      assessed_band: scoreResult.band,
      target_band: scoreResult.target_band,
      assessment_score: scoreResult.raw_pct.toFixed(0),
    },
  });

  goalCard({
    title: goalTitle,
    goalId: goal.goalId,
    claimLink: goal.claimLink,
    progressLink: goal.progressLink,
    planGenerationStatus: goal.planGenerationStatus,
    metadata: {
      cohort: "spring-2026",
      track: "llm-integration",
    },
  });

  divider();
  success(`Priya's enrollment complete!`);
  info("Next: Email the claim link → she auto-joins the org and gets her AI plan");
  warn("Plan generates asynchronously (15–30s). Use get_goal_status to check when ready.");

  if (goal.claimLink) {
    link("Send this link to Priya", goal.claimLink);
  }
}

run().catch((err) => {
  console.error("\n[Error]", err.message);
  process.exit(1);
});
