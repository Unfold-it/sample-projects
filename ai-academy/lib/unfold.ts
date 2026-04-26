// Unfold API client — server-side only (API key never sent to browser)
import type {
  GoalStatus, GoalListResponse, UnfoldResponse,
  AnalyticsResult, GenerateAssessmentResponse,
  ScoreAssessmentResponse, AssessmentCapabilities,
  ImportPlanResponse, ClarifySubmitResponse, EnrichedStep,
} from "./types";

const BASE = (process.env.UNFOLD_API_URL ?? "https://api.unfoldit.com").replace(/\/+$/, "");

async function req<T>(method: string, path: string, body?: unknown, timeoutMs?: number): Promise<T> {
  const key = process.env.UNFOLD_API_KEY;
  if (!key) throw new Error("UNFOLD_API_KEY not set");

  const signal = timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined;
  const res = await fetch(`${BASE}/api/v1/ext${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    let detail = "";
    try { const e = await res.json() as { detail?: string }; detail = e.detail ?? ""; }
    catch { detail = await res.text(); }
    throw new Error(`Unfold API ${res.status}: ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const unfold = {
  createGoal: (p: {
    title: string; description?: string;
    context?: {
      techStack?: string[];
      teamSize?: number;
      timeline?: string;
      constraints?: string;
      resources?: string;
      successCriteria?: string;
      experienceLevel?: string;
      industry?: string;
      additionalNotes?: string;
    };
    goalContext?: string; priority?: string;
    autoRespond?: boolean; clarificationAnswers?: Record<string, string>;
    claimExpiresInDays?: number; progressShare?: boolean;
    metadata?: Record<string, string>;
  }) => req<UnfoldResponse>("POST", "/goals/unfold", {
    title: p.title, description: p.description,
    context: p.context,
    goalContext: p.goalContext ?? "professional",
    priority: p.priority ?? "medium",
    autoRespond: p.autoRespond ?? false,
    clarificationAnswers: p.clarificationAnswers,
    claimExpiresInDays: p.claimExpiresInDays ?? 14,
    progressShare: p.progressShare !== false ? { enabled: true } : undefined,
    metadata: p.metadata,
  }, 55_000),  // Tier 1 (autoRespond=false) takes up to 45s; 55s gives buffer

  getGoal: (id: string) => req<GoalStatus>("GET", `/goals/${id}`),

  listGoals: (p?: {
    status?: string; claimStatus?: string; metadata?: string[];
    assignedEmail?: string; inactiveDays?: number; limit?: number; offset?: number;
  }) => {
    const q = new URLSearchParams();
    if (p?.status) q.set("status", p.status);
    if (p?.claimStatus) q.set("claimStatus", p.claimStatus);
    if (p?.assignedEmail) q.set("assignedEmail", p.assignedEmail);
    if (p?.inactiveDays) q.set("inactiveDays", String(p.inactiveDays));
    if (p?.limit) q.set("limit", String(p.limit));
    if (p?.offset) q.set("offset", String(p.offset));
    p?.metadata?.forEach((t) => q.append("metadata", t));
    const qs = q.toString();
    return req<GoalListResponse>("GET", `/goals${qs ? `?${qs}` : ""}`);
  },

  getAnalytics: (p?: {
    groupBy?: string; inactiveDays?: number; includeFunnel?: boolean;
    includeResources?: boolean; metadata?: Record<string, string>;
    dateFrom?: string; dateTo?: string;
  }) => {
    const q = new URLSearchParams();
    if (p?.groupBy) q.set("groupBy", p.groupBy);
    if (p?.inactiveDays) q.set("inactiveDays", String(p.inactiveDays));
    if (p?.includeFunnel !== undefined) q.set("includeFunnel", String(p.includeFunnel));
    if (p?.includeResources !== undefined) q.set("includeResources", String(p.includeResources));
    if (p?.dateFrom) q.set("dateFrom", p.dateFrom);
    if (p?.dateTo) q.set("dateTo", p.dateTo);
    if (p?.metadata) Object.entries(p.metadata).forEach(([k, v]) => q.append("metadata", `${k}=${v}`));
    const qs = q.toString();
    return req<AnalyticsResult>("GET", `/analytics${qs ? `?${qs}` : ""}`);
  },

  generateAssessment: (p: {
    work_item_context: { title: string; description?: string; domain_tags?: string[] };
    skill: string; target_proficiency: string;
    num_questions: number; difficulty_mix?: Record<string, number>;
    language?: string; request_id: string;
  }) => req<GenerateAssessmentResponse>("POST", "/assessments/generate", p),

  scoreAssessment: (p: {
    assessment_token: string;
    answers: { question_id: string; selected_option_id: string }[];
    request_id: string;
  }) => req<ScoreAssessmentResponse>("POST", "/assessments/score", p),

  getCapabilities: () => req<AssessmentCapabilities>("GET", "/assessments/capabilities"),

  submitClarification: (goalId: string, p: {
    answers?: Record<string, string>;
    acceptAgentAnswers?: boolean;
  }) => req<ClarifySubmitResponse>("POST", `/goals/${goalId}/clarify/submit-all`, {
    answers: p.answers ?? {},
    acceptAgentAnswers: p.acceptAgentAnswers ?? true,
  }),

  importPlan: (p: {
    title: string; description?: string;
    steps: { title: string; description?: string; substeps?: { title: string; description?: string; type?: string }[] }[];
    priority?: string;
  }) => req<ImportPlanResponse>("POST", "/goals/import", {
    title: p.title,
    description: p.description,
    steps: p.steps,
    goalContext: "professional",
    priority: p.priority ?? "medium",
    enrich: true,
    claimExpiresInDays: 14,
    progressShare: { enabled: true },
  }),
};
