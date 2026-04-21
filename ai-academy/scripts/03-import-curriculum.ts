// ─────────────────────────────────────────────────────────────────
// Scenario 3: Import Curated Curriculum (Tier 3 — Passthrough)
//
// You already have a structured curriculum (from your LMS, Notion,
// or curriculum design team). Import it directly into Unfold and
// let the AI enrich each step with:
//   • Critical path identification
//   • Step-to-step dependency mapping
//   • Duration estimates per step
//   • Complexity & severity ratings
//   • Quick-win flags (motivational checkpoints)
//
// This demonstrates the "bring your own plan" workflow where your
// team owns the curriculum structure, and Unfold adds the
// AI-enriched metadata layer on top.
//
// MCP tool used: import_plan
// ─────────────────────────────────────────────────────────────────

import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { UnfoldClient } from "../client.js";
import {
  header, section, success, info, warn, label, link,
  divider, badge,
} from "../utils/display.js";
import type { Curriculum } from "../types.js";

const client = new UnfoldClient(
  process.env.UNFOLD_API_KEY!,
  process.env.UNFOLD_API_URL,
);

const __dir = dirname(fileURLToPath(import.meta.url));
const curriculaDir = join(__dir, "../../curricula");

function loadCurriculum(filename: string): Curriculum {
  const raw = readFileSync(join(curriculaDir, filename), "utf-8");
  return JSON.parse(raw) as Curriculum;
}

async function importCurriculum(curriculum: Curriculum, learnerEmail: string) {
  info(`Importing: "${curriculum.name}" for ${learnerEmail}`);
  info(`Steps: ${curriculum.steps.length}  |  Estimated: ${curriculum.estimatedWeeks} weeks`);

  return client.importPlan({
    title: `${curriculum.name} — ${learnerEmail.split("@")[0]}`,
    description: `${curriculum.description}\n\nTarget audience: ${curriculum.targetAudience}`,
    steps: curriculum.steps,
    goal_context: "professional",
    priority: "high",
    enrich: true,
    enrich_options: {
      dependencies: true,
      critical_path: true,
      duration_estimates: true,
      severity: true,
      complexity: true,
      quick_wins: true,
      resources: false,   // skip resource suggestions to save credits
    },
    claim_expires_in_days: 30,
    progress_share: true,
  });
}

async function run() {
  header("Scenario 3 — Import Curated Curriculum");

  // ── Load curriculum files ─────────────────────────────────────────
  section("Loading Curriculum Files");

  const curricula: Curriculum[] = [
    loadCurriculum("ai-fundamentals.json"),
    loadCurriculum("prompt-engineering.json"),
    loadCurriculum("llm-integration.json"),
    loadCurriculum("ai-safety-ethics.json"),
  ];

  for (const c of curricula) {
    label(`${c.track}`, `${c.steps.length} steps, ${c.estimatedWeeks} weeks`);
  }

  success(`${curricula.length} curricula loaded`);

  // ── Import each curriculum for a sample learner ───────────────────
  section("Importing Curricula (with AI Enrichment)");

  const sampleLearner = "alex@example.com";
  const importedGoals: Array<{
    curriculum: Curriculum;
    result: Awaited<ReturnType<typeof importCurriculum>>;
  }> = [];

  for (const curriculum of curricula) {
    try {
      const result = await importCurriculum(curriculum, sampleLearner);
      importedGoals.push({ curriculum, result });
      success(`Imported "${curriculum.name}"`);
    } catch (err) {
      warn(`Failed to import "${curriculum.name}": ${(err as Error).message}`);
    }
  }

  // ── Show enriched results ─────────────────────────────────────────
  section("Enrichment Results");

  for (const { curriculum, result } of importedGoals) {
    divider();
    console.log(`\n  ${badge(curriculum.track, "cyan")} ${curriculum.name}`);
    label("Goal ID", result.goalId);
    label("Plan Status", result.planGenerationStatus);

    if (result.steps && result.steps.length > 0) {
      console.log(`\n  Enriched Steps (${result.steps.length}):\n`);

      result.steps.slice(0, 5).forEach((step, i) => {
        const flags: string[] = [];
        if (step.isCriticalPath) flags.push(badge("critical-path", "red"));
        if (step.isQuickWin) flags.push(badge("quick-win", "green"));
        if (step.complexity) flags.push(badge(step.complexity, "yellow"));
        if (step.duration) flags.push(`⏱ ${step.duration}`);

        console.log(`    ${i + 1}. ${step.title}`);
        if (flags.length > 0) console.log(`       ${flags.join("  ")}`);
        if (step.dependencies && step.dependencies.length > 0) {
          console.log(`       depends on: ${step.dependencies.slice(0, 2).join(", ")}`);
        }
      });

      if (result.steps.length > 5) {
        info(`  … and ${result.steps.length - 5} more steps`);
      }
    }

    if (result.claimLink) link("Claim Link", result.claimLink);
    if (result.progressLink) link("Progress", result.progressLink);
    console.log();
  }

  // ── Summary ───────────────────────────────────────────────────────
  section("Import Summary");

  divider();
  label("Curricula imported", importedGoals.length);
  label("Learner", sampleLearner);
  label("AI enrichment", "Critical path + dependencies + duration + quick wins");

  success("All curricula imported and enriched");
  info("Claim links ready — learner can start any track immediately");
  warn("For cohort-wide curriculum import, call importPlan once per learner with their metadata");
}

run().catch((err) => {
  console.error("\n[Error]", err.message);
  process.exit(1);
});
