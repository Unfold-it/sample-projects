// Shared types used across API routes and components

export interface GoalStatus {
  goalId: string;
  title: string;
  status: string;
  planGenerationStatus: string;
  assignedTo: { email: string | null; fullName: string | null } | null;
  claimStatus: string;
  claimCreatedAt: string | null;
  claimedAt: string | null;
  progress: { overallPercent: number; totalSteps: number; completedSteps: number; inProgressSteps: number; blockedSteps: number };
  progressLink: string | null;
  lastActivityAt: string | null;
  metadata?: Record<string, string> | null;
  steps?: StepStatus[] | null;
}

export interface StepStatus {
  id: string; title: string; description?: string | null;
  order: number; status: string; durationEstimate?: string | null;
  isCriticalPath: boolean; isQuickWin: boolean;
  timeSpentSeconds: number; complexity?: string | null;
  blockerCount: number; substepCount: number; substepCompletedCount: number;
}

export interface GoalListResponse { goals: GoalStatus[]; total: number; }

export interface UnfoldResponse {
  goalId: string; status: string; planGenerationStatus: string;
  questions?: ClarificationQuestion[];
  agentAnswersUsed?: AgentAnswerDetail[];
  claimLink?: string; claimToken?: string; claimExpiresAt?: string; progressLink?: string;
}

export interface ClarificationQuestion {
  id: string; text: string; type: string; options?: string[];
  defaultAssumption?: string; agentAnswer?: string; agentConfidence?: string;
}

export interface AgentAnswerDetail {
  questionId: string; questionText: string; answer: string; confidence: string;
}

export interface AssessmentQuestion {
  id: string; stem: string;
  options: { id: string; text: string }[];
  difficulty: string; skill_facet?: string | null; score_weight: number;
}

export interface GenerateAssessmentResponse {
  assessment_token: string;
  questions: AssessmentQuestion[];
  band_map: Record<string, number[]>;
  max_raw_score: number; target_band: string;
  model_meta: { provider: string; model_id: string; generated_at: string };
}

export interface ScoreAssessmentResponse {
  raw_score: number; max_raw_score: number; raw_pct: number;
  band: string; target_band: string; gap_bands: number;
  per_question: { question_id: string; correct: boolean; awarded: number }[];
  recommended_action: string;
  suggested_goal_seed?: { title: string; summary: string; skill_focus: string; target_proficiency: string } | null;
}

export interface AnalyticsResult {
  totalGoals: number; activeGoals: number; completedGoals: number; blockedGoals: number;
  completionRate: number; avgDaysToComplete?: number | null;
  claimsTotal: number; claimsClaimed: number; claimsPending: number; claimsExpired: number;
  avgHoursToClaim?: number | null;
  atRiskCount: number;
  atRiskGoals: { goalId: string; title: string; metadata?: Record<string, string> | null; daysInactive: number; progressPercent: number }[];
  inactiveThresholdDays: number;
  completionByDimension?: { dimension: string; total: number; completed: number; completionRate: number }[] | null;
  stepFunnel?: { stepOrder: number; stepTitle: string; totalGoals: number; completed: number; completionRate: number; avgHoursToComplete?: number | null }[] | null;
  resourceEngagement?: { resourceType: string; addedBy: string; total: number; completed: number; engagementRate: number }[] | null;
}

export interface AssessmentCapabilities {
  schema_version: string; supported_languages: string[];
  min_questions: number; max_questions: number;
  supported_proficiency_bands: string[];
  default_band_thresholds: Record<string, number[]>;
  default_difficulty_mix: Record<string, number>;
  open_domain: boolean; token_ttl_seconds: number;
}

// Academy-specific
export type Track = "backend" | "frontend" | "devops" | "data-ml";
export type Band = "beginner" | "low" | "medium" | "high";
