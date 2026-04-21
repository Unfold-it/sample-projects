// ─────────────────────────────────────────────────────────────────
// Unfold AI Academy — Shared Types
// Mirrors the type definitions from the @unfoldit/mcp-server package
// ─────────────────────────────────────────────────────────────────

// ── Goal types ────────────────────────────────────────────────────

export interface GoalCreated {
  goalId: string;
  claimLink: string;
  claimToken: string;
  claimExpiresAt: string;
  progressLink: string | null;
  status: string;
  planGenerationStatus: string;
}

export interface GoalUser {
  email: string | null;
  fullName: string | null;
}

export interface GoalProgress {
  overallPercent: number;
  totalSteps: number;
  completedSteps: number;
  inProgressSteps: number;
  blockedSteps: number;
}

export interface StepStatus {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  status: string;
  startedAt?: string | null;
  completedAt?: string | null;
  durationEstimate?: string | null;
  timeSpentSeconds: number;
  complexity?: string | null;
  priority?: string | null;
  isCriticalPath: boolean;
  isQuickWin: boolean;
  blockerCount: number;
  resourceCount: number;
  substepCount: number;
  substepCompletedCount: number;
}

export interface GoalStatus {
  goalId: string;
  title: string;
  status: string;
  planGenerationStatus: string;
  assignedTo: GoalUser | null;
  claimStatus: string;
  claimCreatedAt: string | null;
  claimedAt: string | null;
  progress: GoalProgress;
  progressLink: string | null;
  lastActivityAt: string | null;
  metadata?: Record<string, string> | null;
  steps?: StepStatus[] | null;
}

export interface GoalListResponse {
  goals: GoalStatus[];
  total: number;
}

// ── Unfold (AI-assisted goal creation) types ──────────────────────

export interface AgentAnswerDetail {
  questionId: string;
  questionText: string;
  answer: string;
  confidence: string;
  source: string;
  sourceType: string;
}

export interface ClarificationQuestion {
  id: string;
  text: string;
  type: string;
  options?: string[];
  multiSelect?: boolean;
  defaultAssumption?: string;
  agentAnswer?: string;
  agentConfidence?: string;
  agentSource?: string;
}

export interface UnfoldResponse {
  goalId: string;
  sessionId?: string;
  status: string;
  planGenerationStatus: string;
  questions?: ClarificationQuestion[];
  agentAnswersUsed?: AgentAnswerDetail[];
  claimLink?: string;
  claimToken?: string;
  claimExpiresAt?: string;
  progressLink?: string;
}

export interface ClarifySubmitResponse {
  goalId: string;
  status: string;
  planGenerationStatus: string;
  agentAnswersUsed?: AgentAnswerDetail[];
}

// ── Import plan types ─────────────────────────────────────────────

export interface EnrichedStep {
  title: string;
  description?: string;
  order: number;
  dependencies?: string[];
  isCriticalPath?: boolean;
  severity?: string;
  duration?: string;
  complexity?: string;
  isQuickWin?: boolean;
  substeps?: unknown[];
}

export interface ImportResponse {
  goalId: string;
  planId?: string;
  status: string;
  planGenerationStatus: string;
  steps?: EnrichedStep[];
  claimLink?: string;
  claimToken?: string;
  claimExpiresAt?: string;
  progressLink?: string;
}

// ── Assessment types ──────────────────────────────────────────────

export interface AssessmentOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  stem: string;
  options: AssessmentOption[];
  score_weight: number;
  difficulty: string;
  skill_facet?: string | null;
}

export interface AssessmentModelMeta {
  provider: string;
  model_id: string;
  generated_at: string;
  validator_passes: string[];
  warnings: string[];
}

export interface GenerateAssessmentResponse {
  assessment_token: string;
  questions: AssessmentQuestion[];
  band_map: Record<string, number[]>;
  max_raw_score: number;
  target_band: string;
  model_meta: AssessmentModelMeta;
}

export interface PerQuestionResult {
  question_id: string;
  correct: boolean;
  awarded: number;
}

export interface SuggestedGoalSeed {
  title: string;
  summary: string;
  skill_focus: string;
  target_proficiency: string;
}

export interface ScoreAssessmentResponse {
  raw_score: number;
  max_raw_score: number;
  raw_pct: number;
  band: string;
  target_band: string;
  gap_bands: number;
  per_question: PerQuestionResult[];
  recommended_action: string;
  suggested_goal_seed?: SuggestedGoalSeed | null;
}

export interface AssessmentCapabilities {
  schema_version: string;
  supported_languages: string[];
  min_questions: number;
  max_questions: number;
  supported_proficiency_bands: string[];
  default_band_thresholds: Record<string, number[]>;
  default_difficulty_mix: Record<string, number>;
  open_domain: boolean;
  token_ttl_seconds: number;
}

// ── Analytics types ───────────────────────────────────────────────

export interface AtRiskGoal {
  goalId: string;
  title: string;
  metadata?: Record<string, string> | null;
  daysInactive: number;
  progressPercent: number;
}

export interface DimensionCompletion {
  dimension: string;
  total: number;
  completed: number;
  completionRate: number;
}

export interface FunnelStep {
  stepOrder: number;
  stepTitle: string;
  totalGoals: number;
  completed: number;
  completionRate: number;
  avgHoursToComplete?: number | null;
}

export interface ResourceEngagement {
  resourceType: string;
  addedBy: string;
  total: number;
  completed: number;
  engagementRate: number;
}

export interface AnalyticsResult {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  blockedGoals: number;
  completionRate: number;
  avgDaysToComplete?: number | null;
  claimsTotal: number;
  claimsClaimed: number;
  claimsPending: number;
  claimsExpired: number;
  avgHoursToClaim?: number | null;
  atRiskCount: number;
  atRiskGoals: AtRiskGoal[];
  inactiveThresholdDays: number;
  completionByDimension?: DimensionCompletion[] | null;
  stepFunnel?: FunnelStep[] | null;
  resourceEngagement?: ResourceEngagement[] | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  metadataFilters?: Record<string, string> | null;
}

// ── Academy domain types ──────────────────────────────────────────

export type Track = "ai-fundamentals" | "prompt-engineering" | "llm-integration" | "ai-safety-ethics";

export type ProficiencyBand = "beginner" | "low" | "medium" | "high";

export interface Developer {
  name: string;
  email: string;
  track: Track;
  experienceLevel: ProficiencyBand;
  currentRole: string;
  techStack: string[];
}

export interface CurriculumStep {
  title: string;
  description?: string;
  substeps?: Array<{
    title: string;
    description?: string;
    type: "research" | "work" | "decision" | "verification";
  }>;
}

export interface Curriculum {
  name: string;
  track: Track;
  description: string;
  targetAudience: string;
  estimatedWeeks: number;
  steps: CurriculumStep[];
}
