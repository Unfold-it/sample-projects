// ─────────────────────────────────────────────────────────────────
// Display Utilities — ANSI-colored console output helpers
// ─────────────────────────────────────────────────────────────────

// ANSI codes
const R = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const MAGENTA = "\x1b[35m";
const BLUE = "\x1b[34m";
const BG_BLUE = "\x1b[44m";

export function header(title: string) {
  const line = "─".repeat(60);
  console.log(`\n${BOLD}${BG_BLUE}  ${title}  ${R}`);
  console.log(`${DIM}${line}${R}\n`);
}

export function section(title: string) {
  console.log(`\n${BOLD}${CYAN}▸ ${title}${R}`);
}

export function success(msg: string) {
  console.log(`${GREEN}✓${R} ${msg}`);
}

export function info(msg: string) {
  console.log(`${BLUE}ℹ${R} ${msg}`);
}

export function warn(msg: string) {
  console.log(`${YELLOW}⚠${R} ${msg}`);
}

export function error(msg: string) {
  console.log(`${RED}✗${R} ${msg}`);
}

export function step(n: number, msg: string) {
  console.log(`  ${DIM}${n}.${R} ${msg}`);
}

export function label(key: string, value: string | number | boolean) {
  console.log(`  ${DIM}${key}:${R} ${BOLD}${value}${R}`);
}

export function link(label: string, url: string) {
  console.log(`  ${DIM}${label}:${R} ${CYAN}${url}${R}`);
}

export function divider() {
  console.log(`${DIM}${"─".repeat(60)}${R}`);
}

export function badge(text: string, color: "green" | "yellow" | "red" | "cyan" | "magenta" = "cyan") {
  const colors = { green: GREEN, yellow: YELLOW, red: RED, cyan: CYAN, magenta: MAGENTA };
  return `${colors[color]}[${text}]${R}`;
}

export function proficiencyBadge(band: string): string {
  const map: Record<string, ReturnType<typeof badge>> = {
    beginner: badge("beginner", "red"),
    low: badge("low", "yellow"),
    medium: badge("medium", "cyan"),
    high: badge("high", "green"),
  };
  return map[band] ?? badge(band, "cyan");
}

export function progressBar(pct: number, width = 30): string {
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  const bar = `${"█".repeat(filled)}${"░".repeat(empty)}`;
  const color = pct >= 80 ? GREEN : pct >= 50 ? CYAN : pct >= 20 ? YELLOW : RED;
  return `${color}${bar}${R} ${BOLD}${pct.toFixed(0)}%${R}`;
}

export function goalCard(goal: {
  title: string;
  goalId: string;
  claimLink?: string;
  progressLink?: string | null;
  planGenerationStatus: string;
  metadata?: Record<string, string> | null;
}) {
  divider();
  console.log(`  ${BOLD}${goal.title}${R}`);
  label("Goal ID", goal.goalId);
  label("Plan Status", goal.planGenerationStatus);
  if (goal.metadata) {
    const tags = Object.entries(goal.metadata)
      .map(([k, v]) => `${DIM}${k}${R}=${CYAN}${v}${R}`)
      .join("  ");
    console.log(`  ${DIM}tags:${R} ${tags}`);
  }
  if (goal.claimLink) link("Claim Link", goal.claimLink);
  if (goal.progressLink) link("Progress", goal.progressLink);
}

export function assessmentResult(result: {
  band: string;
  target_band: string;
  raw_pct: number;
  gap_bands: number;
  recommended_action: string;
  suggested_goal_seed?: { title: string; skill_focus: string; target_proficiency: string } | null;
}) {
  divider();
  console.log(`  ${BOLD}Assessment Result${R}`);
  console.log(`  Score:   ${progressBar(result.raw_pct)}`);
  console.log(`  Band:    ${proficiencyBadge(result.band)}`);
  console.log(`  Target:  ${proficiencyBadge(result.target_band)}`);
  if (result.gap_bands > 0) {
    warn(`Gap: ${result.gap_bands} proficiency band(s) below target`);
    info(`Recommendation: ${result.recommended_action}`);
  } else {
    success(`Target proficiency reached!`);
  }
  if (result.suggested_goal_seed) {
    section("Suggested Learning Goal");
    label("Title", result.suggested_goal_seed.title);
    label("Skill Focus", result.suggested_goal_seed.skill_focus);
    label("Target", result.suggested_goal_seed.target_proficiency);
  }
}

export function analyticsCard(analytics: {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  blockedGoals: number;
  completionRate: number;
  atRiskCount: number;
  claimsClaimed: number;
  claimsTotal: number;
}) {
  divider();
  console.log(`  ${BOLD}Academy Analytics${R}`);
  console.log();
  label("Total Learners", analytics.totalGoals);
  label("Active", analytics.activeGoals);
  label("Completed", analytics.completedGoals);
  label("Blocked", analytics.blockedGoals);
  console.log(`  ${"Completion Rate:".padEnd(18)} ${progressBar(analytics.completionRate * 100)}`);
  console.log();
  label("Claims Sent", analytics.claimsTotal);
  label("Claims Accepted", analytics.claimsClaimed);
  const activationRate = analytics.claimsTotal > 0
    ? (analytics.claimsClaimed / analytics.claimsTotal) * 100
    : 0;
  console.log(`  ${"Activation Rate:".padEnd(18)} ${progressBar(activationRate)}`);
  console.log();
  if (analytics.atRiskCount > 0) {
    warn(`${analytics.atRiskCount} learner(s) at risk (inactive)`);
  } else {
    success("No at-risk learners detected");
  }
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
