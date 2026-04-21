// ─────────────────────────────────────────────────────────────────
// Scenario 7: Check Assessment Capabilities
//
// Quick health-check: verify your API key is working and query
// the live assessment engine capabilities.
//
// Run this first to confirm your setup is correct.
//
// MCP tool used: get_assessment_capabilities
// ─────────────────────────────────────────────────────────────────

import "dotenv/config";
import { UnfoldClient } from "../client.js";
import { header, section, success, label, info, divider } from "../utils/display.js";

const client = new UnfoldClient(
  process.env.UNFOLD_API_KEY!,
  process.env.UNFOLD_API_URL,
);

async function run() {
  header("Scenario 7 — Check Assessment Capabilities");

  if (!process.env.UNFOLD_API_KEY) {
    console.error("Error: UNFOLD_API_KEY not set. Copy .env.example to .env and fill in your key.");
    process.exit(1);
  }

  info("Calling get_assessment_capabilities…");

  const caps = await client.getAssessmentCapabilities();

  section("Assessment Engine Capabilities");
  divider();

  label("Schema version", caps.schema_version);
  label("Question range", `${caps.min_questions} – ${caps.max_questions}`);
  label("Open-domain", String(caps.open_domain));
  label("Token TTL", `${caps.token_ttl_seconds} seconds`);

  console.log();
  console.log("  Supported proficiency bands:");
  caps.supported_proficiency_bands.forEach((b) => {
    const thresholds = caps.default_band_thresholds[b];
    if (thresholds) {
      console.log(`    ${b.padEnd(12)} ${thresholds[0]}% – ${thresholds[1]}%`);
    }
  });

  console.log();
  console.log("  Default difficulty mix:");
  Object.entries(caps.default_difficulty_mix).forEach(([level, pct]) => {
    console.log(`    ${level.padEnd(10)} ${(pct * 100).toFixed(0)}%`);
  });

  console.log();
  console.log("  Supported languages:");
  console.log(`    ${caps.supported_languages.join(", ")}`);

  divider();
  success("API key is valid — you are ready to run the AI Academy scenarios!");
  console.log();
  console.log("  Run scenarios:");
  console.log("    npm run assess-and-enroll   # Scenario 1: smart intake");
  console.log("    npm run batch-onboard       # Scenario 2: enroll a whole team");
  console.log("    npm run import-curriculum   # Scenario 3: import structured curricula");
  console.log("    npm run analytics           # Scenario 4: cohort KPI dashboard");
  console.log("    npm run at-risk             # Scenario 5: detect & help stuck learners");
  console.log("    npm run full-academy        # Scenario 6: full end-to-end demo");
  console.log();
}

run().catch((err) => {
  console.error("\n[Error]", err.message);
  if (err.message.includes("401") || err.message.includes("403")) {
    console.error("Hint: Check your UNFOLD_API_KEY in .env");
  }
  process.exit(1);
});
