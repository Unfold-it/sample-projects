"use client";

import { useState } from "react";
import type {
  WorkItem,
  SkillRequirement,
  ProficiencyBand,
} from "@/lib/work-items";
import {
  WORK_ITEMS,
  LEARNER_PROFILE,
  PROFICIENCY_LABELS,
  PROFICIENCY_COLORS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  TRACK_COLORS,
} from "@/lib/work-items";
import type {
  AssessmentQuestion,
  GenerateAssessmentResponse,
  ScoreAssessmentResponse,
} from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type PanelState =
  | { view: "detail" }
  | { view: "assessing"; skill: SkillRequirement; workItem: WorkItem }
  | { view: "quiz"; skill: SkillRequirement; workItem: WorkItem; assessment: GenerateAssessmentResponse }
  | { view: "scoring" }
  | { view: "results"; skill: SkillRequirement; workItem: WorkItem; score: ScoreAssessmentResponse & { demo?: boolean } }
  | { view: "planning"; claimLink?: string; progressLink?: string; demo?: boolean };

// ── Helpers ──────────────────────────────────────────────────────────────────

function bandDot(band: ProficiencyBand) {
  const dots: Record<ProficiencyBand, string> = {
    beginner: "bg-slate-500",
    low: "bg-amber-400",
    medium: "bg-violet-400",
    high: "bg-emerald-400",
  };
  return dots[band];
}

function ScoreRing({ pct, band }: { pct: number; band: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const strokeColor =
    band === "high" ? "#4ade80" : band === "medium" ? "#a78bfa" : band === "low" ? "#fbbf24" : "#94a3b8";

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={strokeColor} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="fill-white font-semibold" fontSize="18">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ── Work Item Card (left panel) ───────────────────────────────────────────────

function WorkItemCard({ item, active, onClick }: { item: WorkItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-4 rounded-xl border transition-all ${
        active
          ? "border-violet-700/60 bg-violet-950/20"
          : "border-[var(--border)] hover:border-slate-600/60 hover:bg-white/[0.02]"
      }`}
      style={{ background: active ? undefined : "var(--surface)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-slate-200 leading-snug">{item.title}</span>
        <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${PRIORITY_COLORS[item.priority]}`}>
          {item.priority}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[item.status]}`}>
          {item.status.replace("_", " ")}
        </span>
        {item.dueIn && (
          <span className="text-[10px] text-slate-500">due in {item.dueIn}</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-2.5">
        {item.skills.map((s) => (
          <span key={s.id} className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${bandDot(s.targetProficiency)}`} />
          </span>
        ))}
        <span className="text-[10px] text-slate-500 ml-0.5">{item.skills.length} skill{item.skills.length !== 1 ? "s" : ""}</span>
      </div>
    </button>
  );
}

// ── Skill Row (in detail panel) ────────────────────────────────────────────────

function SkillRow({
  skill,
  onAssess,
  disabled,
}: {
  skill: SkillRequirement;
  onAssess: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="rounded-xl border border-[var(--border)] p-4"
      style={{ background: "var(--surface-raised)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-100">{skill.skill}</span>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${PROFICIENCY_COLORS[skill.targetProficiency]}`}
            >
              Target: {PROFICIENCY_LABELS[skill.targetProficiency]}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{skill.description}</p>
        </div>
        <button
          onClick={onAssess}
          disabled={disabled}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600/20 hover:bg-violet-600/30 border border-violet-700/50 text-violet-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <AssessIcon className="w-3 h-3" />
          Assess
        </button>
      </div>

      {/* Quick facts */}
      <div className="border-t border-[var(--border)] pt-3 mt-1">
        <div className="flex items-center gap-1.5 mb-2">
          <BoltIcon className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Quick Facts</span>
        </div>
        <ul className="space-y-1">
          {skill.facts.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-400">
              <span className="mt-[3px] w-1 h-1 rounded-full bg-slate-600 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Quiz Question ─────────────────────────────────────────────────────────────

function QuizQuestion({
  question,
  index,
  total,
  selected,
  onSelect,
}: {
  question: AssessmentQuestion;
  index: number;
  total: number;
  selected?: string;
  onSelect: (optionId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold text-violet-400 bg-violet-950/60 border border-violet-800/50 px-2 py-0.5 rounded-full">
          {index + 1} / {total}
        </span>
        {question.skill_facet && (
          <span className="text-[10px] text-slate-500">{question.skill_facet}</span>
        )}
        <span className="text-[10px] text-slate-600 ml-auto">{question.difficulty}</span>
      </div>

      <p className="text-sm font-medium text-slate-100 leading-relaxed">{question.stem}</p>

      <div className="space-y-2">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
              selected === opt.id
                ? "border-violet-600/80 bg-violet-950/40 text-violet-200"
                : "border-[var(--border)] hover:border-slate-600/60 text-slate-300 hover:text-slate-200"
            }`}
            style={{ background: selected === opt.id ? undefined : "var(--surface-raised)" }}
          >
            <span className="font-medium text-slate-500 mr-2">{opt.id.toUpperCase()}.</span>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Per-Question Result ────────────────────────────────────────────────────────

function PerQuestionResult({
  pq,
  question,
}: {
  pq: { question_id: string; correct: boolean; awarded: number };
  question?: AssessmentQuestion;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs ${
        pq.correct
          ? "border-emerald-900/50 bg-emerald-950/30 text-emerald-300"
          : "border-red-900/50 bg-red-950/30 text-red-300"
      }`}
    >
      <span className="shrink-0 font-bold">{pq.correct ? "✓" : "✗"}</span>
      <span className="flex-1 truncate">{question?.skill_facet ?? pq.question_id}</span>
      <span className="shrink-0 font-medium">{pq.awarded > 0 ? `+${pq.awarded}` : "0"}</span>
    </div>
  );
}

// ── Main Learner Work Page ────────────────────────────────────────────────────

export function LearnerWorkPage() {
  const [selectedItem, setSelectedItem] = useState<WorkItem>(WORK_ITEMS[0]);
  const [panel, setPanel] = useState<PanelState>({ view: "detail" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [assessmentToken, setAssessmentToken] = useState<string>("");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  function selectItem(item: WorkItem) {
    setSelectedItem(item);
    setPanel({ view: "detail" });
    setAnswers({});
    setCurrentQ(0);
    setError(null);
  }

  async function handleAssess(skill: SkillRequirement) {
    setPanel({ view: "assessing", skill, workItem: selectedItem });
    setAnswers({});
    setCurrentQ(0);
    setError(null);

    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: skill.skill,
          role: LEARNER_PROFILE.role,
          techStack: selectedItem.techStack,
          targetProficiency: skill.targetProficiency,
          projectTitle: selectedItem.title,
        }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as GenerateAssessmentResponse;
      setAssessmentToken(data.assessment_token);
      setQuestions(data.questions);
      setPanel({ view: "quiz", skill, workItem: selectedItem, assessment: data });
    } catch (err) {
      setError((err as Error).message);
      setPanel({ view: "detail" });
    }
  }

  function handleAnswer(optionId: string) {
    const q = questions[currentQ];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: optionId }));
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ((n) => n + 1);
    }
  }

  function handlePrev() {
    if (currentQ > 0) setCurrentQ((n) => n - 1);
  }

  async function handleSubmit(skill: SkillRequirement, workItem: WorkItem) {
    setPanel({ view: "scoring" });
    setError(null);

    const answerList = questions.map((q) => ({
      question_id: q.id,
      selected_option_id: answers[q.id] ?? "",
    }));

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_token: assessmentToken, answers: answerList }),
      });
      if (!res.ok) throw new Error(`Scoring failed: ${res.status}`);
      const score = (await res.json()) as ScoreAssessmentResponse & { demo?: boolean };
      setPanel({ view: "results", skill, workItem, score });
    } catch (err) {
      setError((err as Error).message);
      setPanel({ view: "detail" });
    }
  }

  async function handleCreatePlan(
    skill: SkillRequirement,
    workItem: WorkItem,
    score: ScoreAssessmentResponse & { demo?: boolean }
  ) {
    setPanel({ view: "planning" });
    setError(null);

    const seed = score.suggested_goal_seed;
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: LEARNER_PROFILE.name,
          email: LEARNER_PROFILE.email,
          role: LEARNER_PROFILE.role,
          track: workItem.track,
          techStack: workItem.techStack,
          experienceLevel: score.band,
          assessedBand: score.band,
          assessmentScore: score.raw_pct,
          assessmentGap: score.gap_bands,
          goalTitle: seed?.title ?? `${skill.skill} Skills Plan — ${LEARNER_PROFILE.name}`,
          goalSummary:
            seed?.summary ??
            `Targeted learning plan to close the ${skill.skill} skill gap for: ${workItem.title}`,
        }),
      });
      if (!res.ok) throw new Error(`Plan creation failed: ${res.status}`);
      const result = (await res.json()) as {
        goalId: string; claimLink?: string; progressLink?: string; demo?: boolean;
      };
      setPanel({ view: "planning", claimLink: result.claimLink, progressLink: result.progressLink, demo: result.demo });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  function renderRightPanel() {
    const { view } = panel;

    // ── Assessing (loading) ──
    if (view === "assessing") {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
          <div className="w-12 h-12 rounded-full border-2 border-violet-600/30 border-t-violet-500 animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-200">Generating assessment...</p>
            <p className="text-xs text-slate-500 mt-1">
              Crafting questions for <span className="text-violet-400">{panel.skill.skill}</span>
            </p>
          </div>
        </div>
      );
    }

    // ── Quiz ──
    if (view === "quiz") {
      const q = questions[currentQ];
      const allAnswered = questions.every((qu) => answers[qu.id]);
      const answered = answers[q?.id ?? ""];

      return (
        <div className="flex flex-col h-full">
          {/* Quiz header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-violet-400">Skill Assessment</span>
                <span className="text-[10px] text-slate-500">—</span>
                <span className="text-xs text-slate-400">{panel.skill.skill}</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Target: {PROFICIENCY_LABELS[panel.skill.targetProficiency]} proficiency
              </p>
            </div>
            <button
              onClick={() => setPanel({ view: "detail" })}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-[var(--border)]">
            <div
              className="h-full bg-violet-600 transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {q && (
              <QuizQuestion
                question={q}
                index={currentQ}
                total={questions.length}
                selected={answers[q.id]}
                onSelect={handleAnswer}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentQ === 0}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            {currentQ < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!answered}
                className="px-5 py-2 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(panel.skill, panel.workItem)}
                disabled={!allAnswered}
                className="px-5 py-2 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      );
    }

    // ── Scoring ──
    if (view === "scoring") {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
          <div className="w-12 h-12 rounded-full border-2 border-violet-600/30 border-t-violet-500 animate-spin" />
          <p className="text-sm font-medium text-slate-200">Scoring your answers...</p>
        </div>
      );
    }

    // ── Results ──
    if (view === "results") {
      const { score, skill, workItem } = panel;
      const hasGap = score.gap_bands > 0;
      const bandLabel = PROFICIENCY_LABELS[score.band as ProficiencyBand] ?? score.band;
      const targetLabel = PROFICIENCY_LABELS[score.target_band as ProficiencyBand] ?? score.target_band;

      return (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <div>
              <span className="text-xs font-semibold text-violet-400">Assessment Result</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{skill.skill}</p>
            </div>
            <button
              onClick={() => setPanel({ view: "detail" })}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Back to work item
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Score overview */}
            <div
              className="rounded-xl border border-[var(--border)] p-5 flex items-center gap-5"
              style={{ background: "var(--surface-raised)" }}
            >
              <ScoreRing pct={score.raw_pct} band={score.band} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-sm font-bold ${
                      score.band === "high" ? "text-emerald-400" :
                      score.band === "medium" ? "text-violet-400" :
                      score.band === "low" ? "text-amber-400" : "text-slate-400"
                    }`}
                  >
                    {bandLabel}
                  </span>
                  <span className="text-slate-600 text-xs">proficiency</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                  <span>Target:</span>
                  <span className="font-medium text-slate-300">{targetLabel}</span>
                  {hasGap ? (
                    <span className="text-amber-400">— {score.gap_bands} band{score.gap_bands !== 1 ? "s" : ""} below</span>
                  ) : (
                    <span className="text-emerald-400">— met</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{score.recommended_action}</p>
              </div>
            </div>

            {/* Per-question breakdown */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Question Breakdown
              </h3>
              <div className="space-y-2">
                {score.per_question.map((pq) => {
                  const q = questions.find((qu) => qu.id === pq.question_id);
                  return <PerQuestionResult key={pq.question_id} pq={pq} question={q} />;
                })}
              </div>
            </div>

            {/* Gap: suggested goal seed */}
            {hasGap && score.suggested_goal_seed && (
              <div
                className="rounded-xl border border-violet-800/60 p-5"
                style={{ background: "rgba(109, 40, 217, 0.08)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <UnfoldIcon className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-300">Skill gap detected — Unfold a Learning Plan</span>
                </div>
                <p className="text-sm font-medium text-slate-100 mb-1">{score.suggested_goal_seed.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{score.suggested_goal_seed.summary}</p>
                <button
                  onClick={() => handleCreatePlan(skill, workItem, score)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                >
                  <UnfoldIcon className="w-4 h-4" />
                  Create Learning Plan in Unfold
                </button>
              </div>
            )}

            {!hasGap && (
              <div
                className="rounded-xl border border-emerald-800/60 p-4 flex items-center gap-3"
                style={{ background: "rgba(5, 46, 22, 0.4)" }}
              >
                <span className="text-emerald-400 text-lg">✓</span>
                <div>
                  <p className="text-sm font-medium text-emerald-300">You meet the required proficiency</p>
                  <p className="text-xs text-emerald-700 mt-0.5">No learning plan needed — you're ready for this work item.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── Planning ──
    if (view === "planning") {
      const done = !!panel.claimLink;

      if (!done) {
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <div className="w-12 h-12 rounded-full border-2 border-violet-600/30 border-t-violet-500 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-200">Creating your learning plan...</p>
              <p className="text-xs text-slate-500 mt-1">Unfold is generating a personalized step-by-step plan</p>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center h-full px-8 py-16">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-700/50 flex items-center justify-center mx-auto">
              <UnfoldIcon className="w-8 h-8 text-violet-400" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Your learning plan is ready</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Unfold has created a personalized step-by-step plan targeting your specific skill gaps.
                {panel.demo && (
                  <span className="block mt-1 text-violet-400">Demo mode — link shown below is a sample.</span>
                )}
              </p>
            </div>

            {panel.claimLink && (
              <div
                className="rounded-xl border border-[var(--border)] p-4 text-left"
                style={{ background: "var(--surface-raised)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Claim Link</span>
                </div>
                <p className="text-xs text-violet-300 font-mono break-all">{panel.claimLink}</p>
              </div>
            )}

            {panel.progressLink && (
              <div
                className="rounded-xl border border-[var(--border)] p-4 text-left"
                style={{ background: "var(--surface-raised)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ChartIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Progress Link</span>
                </div>
                <p className="text-xs text-violet-300 font-mono break-all">{panel.progressLink}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {panel.claimLink && (
                <a
                  href={panel.claimLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                >
                  Open my learning plan
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => setPanel({ view: "detail" })}
                className="px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Back to work items
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ── Detail (default) ──
    return (
      <div className="flex flex-col h-full">
        {/* Work item header */}
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-base font-semibold text-white leading-snug">{selectedItem.title}</h2>
            <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[selectedItem.priority]}`}>
              {selectedItem.priority} priority
            </span>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed mb-3">{selectedItem.description}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${TRACK_COLORS[selectedItem.track] ?? "text-slate-400 bg-slate-900/60 border-slate-700"}`}>
              {selectedItem.track}
            </span>
            {selectedItem.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-slate-500 bg-slate-900/40 border border-slate-800/60 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="px-6 py-3 border-b border-[var(--border)] flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mr-1">Stack:</span>
          {selectedItem.techStack.map((t) => (
            <span key={t} className="text-[10px] font-medium text-slate-400 bg-slate-900/60 border border-slate-800/60 px-2 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>

        {/* Skills */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <SkillsIcon className="w-3.5 h-3.5 text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Technical Skills Required
            </h3>
            <span className="text-[10px] text-slate-600 ml-auto">{selectedItem.skills.length} skills</span>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg border border-red-900/50 bg-red-950/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {selectedItem.skills.map((skill) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                onAssess={() => handleAssess(skill)}
                disabled={panel.view !== "detail"}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">My Work</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {WORK_ITEMS.length} assigned items — assess your skills before you build
          </p>
        </div>
        {/* Learner badge */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[var(--border)]" style={{ background: "var(--surface)" }}>
          <div className="w-7 h-7 rounded-full bg-violet-900/60 border border-violet-800/50 flex items-center justify-center text-xs font-bold text-violet-300">
            {LEARNER_PROFILE.avatarInitial}
          </div>
          <div>
            <div className="text-xs font-medium text-slate-200">{LEARNER_PROFILE.name}</div>
            <div className="text-[10px] text-slate-500">{LEARNER_PROFILE.role}</div>
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* Left: work item list */}
        <div className="w-72 shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
          <div className="flex items-center gap-2 px-1 mb-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Work Items</span>
            <span className="text-[10px] text-slate-600 ml-auto">{WORK_ITEMS.length} total</span>
          </div>
          {WORK_ITEMS.map((item) => (
            <WorkItemCard
              key={item.id}
              item={item}
              active={selectedItem.id === item.id}
              onClick={() => selectItem(item)}
            />
          ))}
        </div>

        {/* Right: detail panel */}
        <div
          className="flex-1 rounded-xl border border-[var(--border)] overflow-hidden flex flex-col min-h-0"
          style={{ background: "var(--surface)" }}
        >
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function AssessIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v3l2 1.5" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M9 1L2.5 9H7l-1 6 6.5-8H8L9 1z" />
    </svg>
  );
}

function SkillsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}

function UnfoldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L7 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5L9 12" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12V7l3-3 3 3 4-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 14h12" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
