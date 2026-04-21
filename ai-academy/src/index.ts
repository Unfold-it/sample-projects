#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────
// Unfold AI Teams — AI Academy Sample Project
// Run: npm run demo
// ─────────────────────────────────────────────────────────────────

import "dotenv/config";
import { header, section, divider } from "./utils/display.js";

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const R = "\x1b[0m";

header("Unfold AI Teams — AI Academy Sample Project");

console.log(`  ${BOLD}"Train your engineers on AI. See who's learning."${R}`);
console.log();
console.log("  A complete AI learning ecosystem for engineering teams —");
console.log("  built on Unfold MCP tools. Every engineer gets a personalized");
console.log("  learning path anchored to the real project they're building.");
console.log();

section("The 5-Phase Ecosystem");
divider();
console.log(`
  ${CYAN}Phase 1 — ASSESS${R}    Benchmark each engineer before a plan exists
  ${CYAN}Phase 2 — ENROLL${R}    Role-based plans focused on measured skill gaps
  ${CYAN}Phase 3 — LEARN${R}     Engineers work through steps; resources curated automatically
  ${CYAN}Phase 4 — MONITOR${R}   Real-time cohort KPIs, funnel, at-risk
  ${CYAN}Phase 5 — IMPROVE${R}   AI surfaces stall points, gaps, and what to fix
`);

section("Run a Scenario");
divider();

const scenarios = [
  {
    cmd: "npm run check-capabilities",
    phase: "setup",
    color: DIM,
    desc: "Verify API key + query assessment engine",
    tools: "get_assessment_capabilities",
  },
  {
    cmd: "npm run assess-and-enroll",
    phase: "1+2",
    color: CYAN,
    desc: "Assess a developer then create their targeted learning plan",
    tools: "generate_skill_assessment → score_skill_assessment → create_goal",
  },
  {
    cmd: "npm run batch-onboard",
    phase: "2",
    color: CYAN,
    desc: "Enroll a 4-role team (Backend/Frontend/DevOps/Data & ML)",
    tools: "create_goal · get_clarification · submit_clarification",
  },
  {
    cmd: "npm run import-curriculum",
    phase: "3",
    color: CYAN,
    desc: "Import your own curriculum with AI enrichment (Tier 3)",
    tools: "import_plan",
  },
  {
    cmd: "npm run analytics",
    phase: "4",
    color: CYAN,
    desc: "Cohort KPI dashboard — funnel, by-track, at-risk",
    tools: "get_analytics",
  },
  {
    cmd: "npm run ai-insights",
    phase: "5",
    color: GREEN,
    desc: "All 5 intelligence insights: stall points · at-risk · predictor · skill gaps · content",
    tools: "get_analytics · list_goals · generate_skill_assessment · score_skill_assessment",
  },
  {
    cmd: "npm run at-risk",
    phase: "5",
    color: YELLOW,
    desc: "Detect inactive learners and auto-create help plans",
    tools: "list_goals → get_goal_status → create_goal → revoke_claim",
  },
  {
    cmd: "npm run platform-integration",
    phase: "portal",
    color: GREEN,
    desc: "\"Your portal + Unfold\" — enroll from your system, progress flows back",
    tools: "generate_skill_assessment → create_goal → get_goal_status → get_analytics",
  },
  {
    cmd: "npm run full-academy",
    phase: "all",
    color: `\x1b[1m${GREEN}`,
    desc: "Full 5-phase demo — all 11 MCP tools in one run",
    tools: "ALL 11 tools",
  },
];

scenarios.forEach((s) => {
  console.log(`\n  ${s.color}${BOLD}${s.cmd}${R}  ${DIM}[phase ${s.phase}]${R}`);
  console.log(`     ${s.desc}`);
  console.log(`     ${DIM}${s.tools}${R}`);
});

console.log();
section("Getting Started");
divider();
console.log(`
  1. ${CYAN}cp .env.example .env${R}
  2. Add your API key → ${DIM}app.unfoldit.com → Organization → API Keys${R}
     Required scopes: goals:create · goals:read · assessment:generate · assessment:score · analytics:read
  3. ${CYAN}npm install${R}
  4. ${CYAN}npm run check-capabilities${R}   # verify connection
  5. ${CYAN}npm run full-academy${R}          # run the full demo
`);

section("Claude Desktop / Cursor MCP");
divider();
console.log(`
  Configure Unfold as an MCP server, then ask Claude:

  ${DIM}"Assess the backend team on RAG skills before we start the knowledge base project."${R}
  ${DIM}"Show me who's at risk in the spring-2026 cohort."${R}
  ${DIM}"Step 4 is a stall point — create re-engagement plans for stuck engineers."${R}
  ${DIM}"65% of the team is below target on RAG. Generate focused learning paths."${R}

  See configs/claude-desktop-config.json and configs/cursor-config.json
`);
