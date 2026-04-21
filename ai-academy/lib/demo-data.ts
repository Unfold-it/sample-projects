// Rich demo data matching the AI Teams page visuals exactly.
// Used when UNFOLD_API_KEY is not set, so the app always looks great.

import type { AnalyticsResult, GoalListResponse, GoalStatus } from "./types";

export const DEMO_ANALYTICS: AnalyticsResult = {
  totalGoals: 24,
  activeGoals: 19,
  completedGoals: 16,
  blockedGoals: 2,
  completionRate: 0.67,
  avgDaysToComplete: 12.4,
  claimsTotal: 24,
  claimsClaimed: 21,
  claimsPending: 3,
  claimsExpired: 0,
  avgHoursToClaim: 2.1,
  atRiskCount: 3,
  inactiveThresholdDays: 7,
  atRiskGoals: [
    { goalId: "g-001", title: "Backend Engineer AI Skills — Alex T.", metadata: { track: "backend", learner_email: "alex.t@example.com" }, daysInactive: 9, progressPercent: 67 },
    { goalId: "g-002", title: "Frontend Engineer AI Skills — Sam K.", metadata: { track: "frontend", learner_email: "sam.k@example.com" }, daysInactive: 7, progressPercent: 45 },
    { goalId: "g-003", title: "DevOps Platform AI Skills — Jordan M.", metadata: { track: "devops", learner_email: "jordan.m@example.com" }, daysInactive: 12, progressPercent: 33 },
  ],
  completionByDimension: [
    { dimension: "data-ml",  total: 7,  completed: 6,  completionRate: 0.84 },
    { dimension: "frontend", total: 6,  completed: 5,  completionRate: 0.78 },
    { dimension: "devops",   total: 4,  completed: 3,  completionRate: 0.71 },
    { dimension: "backend",  total: 7,  completed: 4,  completionRate: 0.62 },
  ],
  stepFunnel: [
    { stepOrder: 1, stepTitle: "AI Basics & Setup",    totalGoals: 24, completed: 23, completionRate: 0.96, avgHoursToComplete: 1.2 },
    { stepOrder: 2, stepTitle: "Prompt Fundamentals",  totalGoals: 24, completed: 21, completionRate: 0.89, avgHoursToComplete: 2.1 },
    { stepOrder: 3, stepTitle: "Tool Use & APIs",       totalGoals: 24, completed: 18, completionRate: 0.78, avgHoursToComplete: 3.4 },
    { stepOrder: 4, stepTitle: "Building Agents",       totalGoals: 24, completed: 13, completionRate: 0.55, avgHoursToComplete: 7.2 },
    { stepOrder: 5, stepTitle: "Production Deploy",     totalGoals: 24, completed: 9,  completionRate: 0.38, avgHoursToComplete: 5.1 },
    { stepOrder: 6, stepTitle: "Advanced Patterns",     totalGoals: 24, completed: 5,  completionRate: 0.21, avgHoursToComplete: null },
  ],
  resourceEngagement: [
    { resourceType: "video",   addedBy: "ai",   total: 48, completed: 38, engagementRate: 0.79 },
    { resourceType: "article", addedBy: "ai",   total: 96, completed: 61, engagementRate: 0.64 },
    { resourceType: "code",    addedBy: "ai",   total: 72, completed: 58, engagementRate: 0.81 },
    { resourceType: "article", addedBy: "user", total: 12, completed: 5,  engagementRate: 0.42 },
  ],
};

export const DEMO_BY_TRACK: AnalyticsResult = {
  ...DEMO_ANALYTICS,
  completionByDimension: DEMO_ANALYTICS.completionByDimension,
};

export const makeGoal = (overrides: Partial<GoalStatus>): GoalStatus => ({
  goalId: overrides.goalId ?? "g-demo",
  title: overrides.title ?? "Demo Goal",
  status: overrides.status ?? "in_progress",
  planGenerationStatus: "completed",
  assignedTo: overrides.assignedTo ?? { email: "demo@example.com", fullName: "Demo User" },
  claimStatus: overrides.claimStatus ?? "claimed",
  claimCreatedAt: "2026-03-01T10:00:00Z",
  claimedAt: "2026-03-01T11:00:00Z",
  progress: overrides.progress ?? { overallPercent: 60, totalSteps: 6, completedSteps: 3, inProgressSteps: 1, blockedSteps: 0 },
  progressLink: "https://app.unfoldit.com/progress/demo",
  lastActivityAt: overrides.lastActivityAt ?? new Date(Date.now() - 2 * 86400000).toISOString(),
  metadata: overrides.metadata,
  steps: overrides.steps,
});

export const DEMO_GOALS: GoalListResponse = {
  total: 24,
  goals: [
    makeGoal({ goalId: "g-101", title: "LLM API Integration — Aisha O.", status: "in_progress",  assignedTo: { email: "aisha@example.com", fullName: "Aisha Okonkwo" }, progress: { overallPercent: 83, totalSteps: 6, completedSteps: 5, inProgressSteps: 1, blockedSteps: 0 }, metadata: { track: "backend",  role: "Backend Engineer",  cohort: "spring-2026" }, lastActivityAt: new Date(Date.now() - 1 * 86400000).toISOString() }),
    makeGoal({ goalId: "g-102", title: "AI UX & Streaming — Marcus W.",  status: "in_progress",  assignedTo: { email: "marcus@example.com", fullName: "Marcus Wei" },     progress: { overallPercent: 50, totalSteps: 6, completedSteps: 3, inProgressSteps: 1, blockedSteps: 0 }, metadata: { track: "frontend", role: "Frontend Engineer", cohort: "spring-2026" }, lastActivityAt: new Date(Date.now() - 2 * 86400000).toISOString() }),
    makeGoal({ goalId: "g-103", title: "RAG & Retrieval — Lena F.",       status: "completed",    assignedTo: { email: "lena@example.com", fullName: "Lena Fischer" },      progress: { overallPercent: 100,totalSteps: 6, completedSteps: 6, inProgressSteps: 0, blockedSteps: 0 }, metadata: { track: "data-ml", role: "Data Engineer",     cohort: "spring-2026" }, lastActivityAt: new Date(Date.now() - 4 * 86400000).toISOString() }),
    makeGoal({ goalId: "g-104", title: "LLM Infrastructure — Jordan R.",  status: "in_progress",  assignedTo: { email: "jordan@example.com", fullName: "Jordan Rivera" }, progress: { overallPercent: 33, totalSteps: 6, completedSteps: 2, inProgressSteps: 1, blockedSteps: 0 }, metadata: { track: "devops",   role: "DevOps Engineer",   cohort: "spring-2026" }, lastActivityAt: new Date(Date.now() - 12 * 86400000).toISOString() }),
    makeGoal({ goalId: "g-105", title: "LLM API Integration — Alex T.",   status: "in_progress",  assignedTo: { email: "alex.t@example.com", fullName: "Alex Tran" },     progress: { overallPercent: 67, totalSteps: 6, completedSteps: 4, inProgressSteps: 1, blockedSteps: 0 }, metadata: { track: "backend",  role: "Backend Engineer",  cohort: "spring-2026" }, lastActivityAt: new Date(Date.now() - 9 * 86400000).toISOString() }),
    makeGoal({ goalId: "g-106", title: "AI UX & Streaming — Sam K.",      status: "in_progress",  assignedTo: { email: "sam.k@example.com", fullName: "Sam Kim" },         progress: { overallPercent: 45, totalSteps: 6, completedSteps: 2, inProgressSteps: 2, blockedSteps: 0 }, metadata: { track: "frontend", role: "Frontend Engineer", cohort: "spring-2026" }, lastActivityAt: new Date(Date.now() - 7 * 86400000).toISOString() }),
    makeGoal({ goalId: "g-107", title: "RAG & Retrieval — Elena P.",       status: "completed",    assignedTo: { email: "elena@example.com", fullName: "Elena Petrov" },    progress: { overallPercent: 100,totalSteps: 6, completedSteps: 6, inProgressSteps: 0, blockedSteps: 0 }, metadata: { track: "data-ml", role: "Data Engineer",     cohort: "spring-2026" }, lastActivityAt: new Date(Date.now() - 3 * 86400000).toISOString() }),
    makeGoal({ goalId: "g-108", title: "LLM Infrastructure — Chris B.",   status: "in_progress",  assignedTo: { email: "chris@example.com", fullName: "Chris Brown" },     progress: { overallPercent: 17, totalSteps: 6, completedSteps: 1, inProgressSteps: 1, blockedSteps: 0 }, metadata: { track: "devops",   role: "DevOps Engineer",   cohort: "spring-2026" }, lastActivityAt: new Date(Date.now() - 3 * 86400000).toISOString() }),
  ],
};

export const DEMO_CAPABILITIES = {
  schema_version: "1.0",
  supported_languages: ["en"],
  min_questions: 3,
  max_questions: 20,
  supported_proficiency_bands: ["beginner", "low", "medium", "high"],
  default_band_thresholds: { beginner: [0, 10], low: [11, 50], medium: [51, 85], high: [86, 100] },
  default_difficulty_mix: { easy: 0.2, medium: 0.5, hard: 0.3 },
  open_domain: true,
  token_ttl_seconds: 3600,
};

// Health score: derived from completion rate, claim activation, and at-risk ratio
export function computeHealthScore(a: AnalyticsResult): number {
  const completion = a.completionRate * 40;
  const activation = a.claimsTotal > 0 ? (a.claimsClaimed / a.claimsTotal) * 30 : 30;
  const risk = a.totalGoals > 0 ? Math.max(0, 30 - (a.atRiskCount / a.totalGoals) * 60) : 30;
  return Math.round(completion + activation + risk);
}
