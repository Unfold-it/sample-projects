// ─────────────────────────────────────────────────────────────────
// Scenario 5: At-Risk Learner Intervention
//
// Automated loop that detects learners who have gone inactive
// and creates targeted intervention goals to re-engage them.
//
// Flow:
//  1. List goals with 7+ days of inactivity (list_goals)
//  2. For each at-risk learner:
//     a. Fetch their current goal status (get_goal_status)
//     b. Identify which step they are stuck on
//     c. Create a focused "unstuck" goal with AI-generated help plan
//  3. Optionally revoke expired claim links and reissue them
//
// This is designed to run as a scheduled job (e.g. daily cron).
//
// MCP tools used:
//   list_goals → get_goal_status → create_goal → revoke_claim
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

const INACTIVE_THRESHOLD_DAYS = 7;
const COHORT = "spring-2026";

async function buildInterventionGoal(params: {
  learnerEmail: string;
  originalGoalTitle: string;
  stuckStepTitle: string;
  stuckStepDescription: string | null | undefined;
  progressPercent: number;
  daysInactive: number;
  track: string;
  techStack?: string[];
}) {
  const title = `Getting Unstuck: "${params.stuckStepTitle}"`;

  return client.createGoal({
    title,
    description: `
Personalized support plan for a learner who has been inactive for ${params.daysInactive} days.

Context:
- Original learning goal: "${params.originalGoalTitle}"
- Currently stuck on: "${params.stuckStepTitle}"
- Step description: ${params.stuckStepDescription ?? "Not available"}
- Overall progress: ${params.progressPercent.toFixed(0)}% complete
- Track: ${params.track}

Create a focused 3–5 step action plan to help them:
1. Understand why this step might be challenging
2. Break it into smaller, achievable sub-tasks
3. Find the right resources or practice exercises
4. Build confidence to complete the step and continue
    `.trim(),
    context: {
      tech_stack: params.techStack ?? [],
      timeline: "1 week",
      constraints: "learner is blocked and may need extra motivation",
      success_criteria: `Complete "${params.stuckStepTitle}" and resume the main learning path`,
      additional_notes: `Re-engagement intervention. Learner inactive ${params.daysInactive} days. Progress: ${params.progressPercent.toFixed(0)}%`,
    },
    auto_respond: true,
    goal_context: "professional",
    priority: "high",
    claim_expires_in_days: 7,
    progress_share: false,
    metadata: {
      cohort: COHORT,
      track: params.track,
      learner_email: params.learnerEmail,
      intervention_type: "at-risk-unstuck",
      original_goal_context: params.originalGoalTitle.slice(0, 64),
    },
  });
}

async function run() {
  header("Scenario 5 — At-Risk Learner Intervention");

  info(`Scanning for learners inactive ${INACTIVE_THRESHOLD_DAYS}+ days in cohort: ${COHORT}`);

  // ── Step 1: Find at-risk goals ────────────────────────────────────
  section("Step 1: Identify At-Risk Learners");

  const atRiskList = await client.listGoals({
    inactive_days: INACTIVE_THRESHOLD_DAYS,
    metadata: [`cohort=${COHORT}`],
    status: "in_progress",
    limit: 50,
  });

  if (atRiskList.total === 0) {
    success("No at-risk learners found — all cohort members are active!");
    return;
  }

  warn(`Found ${atRiskList.total} at-risk learner(s)`);
  divider();

  for (const g of atRiskList.goals) {
    const track = g.metadata?.track ?? "unknown";
    const email = g.metadata?.learner_email ?? g.assignedTo?.email ?? "unknown";
    console.log(`  ${badge(track, "yellow")}  ${g.title.slice(0, 50).padEnd(50)}`);
    console.log(`     ${email}  ·  progress: ${progressBar(g.progress.overallPercent, 20)}`);
    if (g.lastActivityAt) {
      console.log(`     last active: ${new Date(g.lastActivityAt).toLocaleDateString()}`);
    }
    console.log();
  }

  // ── Step 2: Deep-dive each at-risk goal ───────────────────────────
  section("Step 2: Diagnose — Find Stuck Steps");

  const interventions: Array<{
    email: string;
    originalGoalTitle: string;
    stuckStep: string;
    track: string;
    daysInactive: number;
    progressPercent: number;
    interventionGoalId?: string;
    interventionClaimLink?: string;
  }> = [];

  for (const goal of atRiskList.goals) {
    const email = goal.metadata?.learner_email ?? goal.assignedTo?.email ?? "unknown";
    const track = goal.metadata?.track ?? "unknown";

    let stuckStepTitle = "Getting started";
    let stuckStepDescription: string | null = null;

    // Fetch full step details to find where they're stuck
    try {
      const status = await client.getGoalStatus(goal.goalId);

      // Find the first in-progress or not-started step
      const stuckStep = status.steps?.find(
        (s) => s.status === "in_progress" || s.status === "not_started"
      ) ?? status.steps?.[0];

      if (stuckStep) {
        stuckStepTitle = stuckStep.title;
        stuckStepDescription = stuckStep.description ?? null;
      }

      label("Learner", email);
      label("Stuck at", stuckStepTitle);
      label("Progress", `${status.progress.overallPercent.toFixed(0)}%`);
      console.log();

      interventions.push({
        email,
        originalGoalTitle: goal.title,
        stuckStep: stuckStepTitle,
        track,
        daysInactive: 7, // from list_goals inactive_days filter
        progressPercent: status.progress.overallPercent,
      });

      // Also check for expired claims that should be reissued
      if (goal.claimStatus === "expired" || goal.claimStatus === "unclaimed") {
        warn(`Claim link for ${email} is ${goal.claimStatus} — consider revoking and reissuing`);
        // In production: await client.revokeClaim(goal.claimToken); then re-create goal
      }

    } catch (err) {
      warn(`Could not fetch details for goal ${goal.goalId}: ${(err as Error).message}`);
    }
  }

  // ── Step 3: Create intervention goals ────────────────────────────
  section("Step 3: Create Targeted Intervention Goals");
  info("Generating personalized 'unstuck' plans for each at-risk learner…");

  for (const intervention of interventions) {
    try {
      const result = await buildInterventionGoal({
        learnerEmail: intervention.email,
        originalGoalTitle: intervention.originalGoalTitle,
        stuckStepTitle: intervention.stuckStep,
        stuckStepDescription: null,
        progressPercent: intervention.progressPercent,
        daysInactive: intervention.daysInactive,
        track: intervention.track,
      });

      intervention.interventionGoalId = result.goalId;
      intervention.interventionClaimLink = result.claimLink;

      success(`Intervention goal created for ${intervention.email}`);
    } catch (err) {
      warn(`Failed to create intervention for ${intervention.email}: ${(err as Error).message}`);
    }
  }

  // ── Step 4: Show intervention summary ────────────────────────────
  section("Step 4: Intervention Summary");

  divider();
  for (const i of interventions) {
    console.log(`\n  ${badge("at-risk", "red")}  ${i.email}`);
    label("  Stuck on", i.stuckStep.slice(0, 60));
    label("  Track", i.track);
    label("  Progress", `${i.progressPercent.toFixed(0)}%`);
    if (i.interventionClaimLink) {
      link("  Help Plan", i.interventionClaimLink);
    }
  }

  divider();
  success(`${interventions.filter((i) => i.interventionGoalId).length} intervention goal(s) created`);
  info("Send the help plan links via Slack or email to re-engage learners");
  info("Schedule this scenario to run daily as a cron job for automated at-risk monitoring");
}

run().catch((err) => {
  console.error("\n[Error]", err.message);
  process.exit(1);
});
