// ─────────────────────────────────────────────────────────────────
// Unfold API Client
// Wraps the Unfold external REST API (/api/v1/ext/*)
// Same endpoints used by the @unfoldit/mcp-server package
// ─────────────────────────────────────────────────────────────────

import type {
  GoalStatus,
  GoalListResponse,
  UnfoldResponse,
  ClarifySubmitResponse,
  ImportResponse,
  AnalyticsResult,
  GenerateAssessmentResponse,
  ScoreAssessmentResponse,
  AssessmentCapabilities,
  CurriculumStep,
} from "./types.js";

const DEFAULT_BASE_URL = "https://api.unfoldit.com";

export class UnfoldClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}/api/v1/ext${path}`;

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let detail = "";
      try {
        const err = await res.json() as { detail?: string | unknown };
        detail = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
      } catch {
        detail = await res.text();
      }
      throw new Error(`Unfold API error (${res.status}): ${detail}`);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  // ── Goal creation — AI-assisted (create_goal MCP tool) ────────────

  async createGoal(params: {
    title: string;
    description?: string;
    context?: {
      tech_stack?: string[];
      team_size?: number;
      timeline?: string;
      constraints?: string;
      resources?: string;
      success_criteria?: string;
      experience_level?: string;
      industry?: string;
      additional_notes?: string;
    };
    auto_respond?: boolean;
    clarification_answers?: Record<string, string>;
    goal_context?: "personal" | "professional";
    priority?: "low" | "medium" | "high";
    claim_expires_in_days?: number;
    progress_share?: boolean;
    metadata?: Record<string, string>;
  }): Promise<UnfoldResponse> {
    return this.request<UnfoldResponse>("POST", "/goals/unfold", {
      title: params.title,
      description: params.description,
      context: params.context,
      goalContext: params.goal_context ?? "professional",
      priority: params.priority ?? "medium",
      autoRespond: params.auto_respond ?? true,
      clarificationAnswers: params.clarification_answers,
      claimExpiresInDays: params.claim_expires_in_days ?? 30,
      progressShare: params.progress_share !== false ? { enabled: true } : undefined,
      metadata: params.metadata,
    });
  }

  // ── Goal status (get_goal_status MCP tool) ────────────────────────

  async getGoalStatus(goalId: string): Promise<GoalStatus> {
    return this.request<GoalStatus>("GET", `/goals/${goalId}`);
  }

  // ── List goals (list_goals MCP tool) ─────────────────────────────

  async listGoals(params?: {
    status?: "draft" | "in_progress" | "completed" | "blocked" | "paused";
    claim_status?: "unclaimed" | "claimed" | "expired" | "revoked";
    metadata?: string[];
    assigned_email?: string;
    inactive_days?: number;
    limit?: number;
    offset?: number;
  }): Promise<GoalListResponse> {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.claim_status) q.set("claimStatus", params.claim_status);
    if (params?.assigned_email) q.set("assignedEmail", params.assigned_email);
    if (params?.inactive_days) q.set("inactiveDays", String(params.inactive_days));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    if (params?.metadata) {
      for (const tag of params.metadata) q.append("metadata", tag);
    }
    const qs = q.toString();
    return this.request<GoalListResponse>("GET", `/goals${qs ? `?${qs}` : ""}`);
  }

  // ── Revoke claim link (revoke_claim MCP tool) ─────────────────────

  async revokeClaim(claimToken: string): Promise<void> {
    await this.request<void>("DELETE", `/goals/claims/${claimToken}`);
  }

  // ── Clarification — get pending questions (get_clarification MCP tool) ──

  async getClarification(goalId: string): Promise<UnfoldResponse> {
    return this.request<UnfoldResponse>("GET", `/goals/${goalId}/clarify`);
  }

  // ── Clarification — submit answers (submit_clarification MCP tool) ──

  async submitClarification(
    goalId: string,
    params: { answers?: Record<string, string>; accept_agent_answers?: boolean },
  ): Promise<ClarifySubmitResponse> {
    return this.request<ClarifySubmitResponse>("POST", `/goals/${goalId}/clarify/submit-all`, {
      answers: params.answers ?? {},
      acceptAgentAnswers: params.accept_agent_answers ?? true,
    });
  }

  // ── Import plan (import_plan MCP tool) ───────────────────────────

  async importPlan(params: {
    title: string;
    description?: string;
    steps: CurriculumStep[];
    goal_context?: "personal" | "professional";
    priority?: "low" | "medium" | "high";
    enrich?: boolean;
    enrich_options?: {
      dependencies?: boolean;
      critical_path?: boolean;
      duration_estimates?: boolean;
      severity?: boolean;
      complexity?: boolean;
      quick_wins?: boolean;
      resources?: boolean;
    };
    claim_expires_in_days?: number;
    progress_share?: boolean;
  }): Promise<ImportResponse> {
    return this.request<ImportResponse>("POST", "/goals/import", {
      title: params.title,
      description: params.description,
      steps: params.steps,
      goalContext: params.goal_context ?? "professional",
      priority: params.priority ?? "medium",
      enrich: params.enrich ?? true,
      enrichOptions: params.enrich_options ? {
        dependencies: params.enrich_options.dependencies,
        criticalPath: params.enrich_options.critical_path,
        durationEstimates: params.enrich_options.duration_estimates,
        severity: params.enrich_options.severity,
        complexity: params.enrich_options.complexity,
        quickWins: params.enrich_options.quick_wins,
        resources: params.enrich_options.resources,
      } : undefined,
      claimExpiresInDays: params.claim_expires_in_days ?? 30,
      progressShare: params.progress_share !== false ? { enabled: true } : undefined,
    });
  }

  // ── Analytics (get_analytics MCP tool) ───────────────────────────

  async getAnalytics(params?: {
    group_by?: string;
    inactive_days?: number;
    include_funnel?: boolean;
    include_resources?: boolean;
    metadata?: Record<string, string>;
    date_from?: string;
    date_to?: string;
  }): Promise<AnalyticsResult> {
    const q = new URLSearchParams();
    if (params?.group_by) q.set("groupBy", params.group_by);
    if (params?.inactive_days) q.set("inactiveDays", String(params.inactive_days));
    if (params?.include_funnel !== undefined) q.set("includeFunnel", String(params.include_funnel));
    if (params?.include_resources !== undefined) q.set("includeResources", String(params.include_resources));
    if (params?.date_from) q.set("dateFrom", params.date_from);
    if (params?.date_to) q.set("dateTo", params.date_to);
    if (params?.metadata) {
      for (const [k, v] of Object.entries(params.metadata)) q.append("metadata", `${k}=${v}`);
    }
    const qs = q.toString();
    return this.request<AnalyticsResult>("GET", `/analytics${qs ? `?${qs}` : ""}`);
  }

  // ── Generate skill assessment (generate_skill_assessment MCP tool) ─

  async generateAssessment(params: {
    work_item_context: {
      title: string;
      description?: string;
      domain_tags?: string[];
    };
    skill: string;
    target_proficiency: "beginner" | "low" | "medium" | "high";
    num_questions: number;
    difficulty_mix?: Record<string, number>;
    band_thresholds?: Record<string, number[]>;
    language?: string;
    request_id: string;
  }): Promise<GenerateAssessmentResponse> {
    return this.request<GenerateAssessmentResponse>("POST", "/assessments/generate", params);
  }

  // ── Score skill assessment (score_skill_assessment MCP tool) ─────

  async scoreAssessment(params: {
    assessment_token: string;
    answers: Array<{ question_id: string; selected_option_id: string }>;
    band_thresholds?: Record<string, number[]>;
    request_id: string;
  }): Promise<ScoreAssessmentResponse> {
    return this.request<ScoreAssessmentResponse>("POST", "/assessments/score", params);
  }

  // ── Assessment capabilities (get_assessment_capabilities MCP tool) ─

  async getAssessmentCapabilities(): Promise<AssessmentCapabilities> {
    return this.request<AssessmentCapabilities>("GET", "/assessments/capabilities");
  }
}
