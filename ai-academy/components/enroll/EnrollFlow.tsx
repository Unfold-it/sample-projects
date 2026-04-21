"use client";
import { useState } from "react";
import type { AssessmentQuestion, ScoreAssessmentResponse, GenerateAssessmentResponse } from "@/lib/types";

type Step = "profile" | "assessing" | "quiz" | "scoring" | "results" | "enrolling" | "done";

interface Profile {
  name: string; email: string; role: string; track: string; techStack: string; targetProficiency: string;
}

const ROLES = [
  { value: "Backend Engineer",          track: "backend",  skill: "LLM API Integration" },
  { value: "Frontend Engineer",         track: "frontend", skill: "AI UX & Streaming Interfaces" },
  { value: "DevOps / Platform Engineer",track: "devops",   skill: "LLM Infrastructure" },
  { value: "Data & ML Engineer",        track: "data-ml",  skill: "RAG & Retrieval" },
];

const BAND_COLORS: Record<string, string> = {
  beginner: "text-red-400",
  low:      "text-amber-400",
  medium:   "text-violet-400",
  high:     "text-emerald-400",
};

function Stepper({ current }: { current: number }) {
  const steps = ["Profile", "Assess", "Results", "Enroll"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className={`flex items-center gap-2 ${i < current ? "text-violet-400" : i === current ? "text-white" : "text-slate-600"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
              i < current ? "bg-violet-600 border-violet-600 text-white" : i === current ? "border-violet-500 text-violet-400" : "border-[var(--border)] text-slate-600"
            }`}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mx-3 ${i < current ? "bg-violet-700" : "bg-[var(--border)]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function EnrollFlow() {
  const [step, setStep] = useState<Step>("profile");
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [assessment, setAssessment] = useState<GenerateAssessmentResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<ScoreAssessmentResponse | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [enrollResult, setEnrollResult] = useState<{ claimLink: string; progressLink?: string; goalId: string; demo: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedRole = ROLES.find((r) => r.value === profile.role);
  const stepIndex = step === "profile" || step === "assessing" ? 0
    : step === "quiz" || step === "scoring" ? 1
    : step === "results" || step === "enrolling" ? 2
    : 3;

  async function handleStartAssessment() {
    if (!profile.name || !profile.email || !profile.role) return;
    setStep("assessing");
    setError(null);
    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: selectedRole?.skill ?? "AI Fundamentals",
          role: profile.role,
          techStack: (profile.techStack ?? "").split(",").map((s) => s.trim()).filter(Boolean),
          targetProficiency: profile.targetProficiency ?? "medium",
          projectTitle: "RAG Knowledge Base Agent",
        }),
      });
      const data = await res.json() as GenerateAssessmentResponse;
      setAssessment(data);
      setCurrentQ(0);
      setAnswers({});
      setStep("quiz");
    } catch (e) {
      setError((e as Error).message);
      setStep("profile");
    }
  }

  async function handleSubmitAnswers() {
    if (!assessment) return;
    setStep("scoring");
    const answerList = assessment.questions.map((q) => ({
      question_id: q.id,
      selected_option_id: answers[q.id] ?? q.options[0]!.id,
    }));
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_token: assessment.assessment_token, answers: answerList }),
      });
      const data = await res.json() as ScoreAssessmentResponse;
      setScore(data);
      setStep("results");
    } catch (e) {
      setError((e as Error).message);
      setStep("quiz");
    }
  }

  async function handleEnroll() {
    if (!profile.name || !profile.email || !profile.role || !score) return;
    setStep("enrolling");
    setError(null);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name, email: profile.email,
          role: profile.role, track: selectedRole?.track ?? "backend",
          techStack: (profile.techStack ?? "").split(",").map((s) => s.trim()),
          experienceLevel: profile.targetProficiency ?? "medium",
          assessedBand: score.band,
          assessmentScore: score.raw_pct,
          assessmentGap: score.gap_bands,
          goalTitle: score.suggested_goal_seed?.title,
          goalSummary: score.suggested_goal_seed?.summary,
        }),
      });
      const data = await res.json() as { claimLink: string; progressLink?: string; goalId: string; demo: boolean };
      setEnrollResult(data);
      setStep("done");
    } catch (e) {
      setError((e as Error).message);
      setStep("results");
    }
  }

  const card = "rounded-xl border border-[var(--border)] p-6";

  // ── Profile form ───────────────────────────────────────────────
  if (step === "profile") return (
    <div className={card} style={{ background: "var(--surface)" }}>
      <Stepper current={0} />
      <h2 className="text-base font-semibold text-white mb-5">Engineer profile</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name" type="text" placeholder="Aisha Okonkwo" value={profile.name ?? ""} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} />
          <Field label="Email" type="email" placeholder="aisha@company.com" value={profile.email ?? ""} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">Role</label>
          <select
            className="w-full px-3 py-2 rounded-lg text-sm text-white border border-[var(--border)] bg-[var(--surface-raised)] focus:outline-none focus:border-violet-500"
            value={profile.role ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))}
          >
            <option value="" disabled>Select role…</option>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.value}</option>)}
          </select>
        </div>
        <Field label="Tech stack (comma-separated)" type="text" placeholder="Python, FastAPI, PostgreSQL" value={profile.techStack ?? ""} onChange={(v) => setProfile((p) => ({ ...p, techStack: v }))} />
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">Target proficiency</label>
          <div className="flex gap-2">
            {["beginner", "low", "medium", "high"].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setProfile((p) => ({ ...p, targetProficiency: b }))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  profile.targetProficiency === b
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "border-[var(--border)] text-slate-400 hover:text-white hover:border-slate-600"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          onClick={handleStartAssessment}
          disabled={!profile.name || !profile.email || !profile.role}
          className="w-full py-2.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Generate Skill Assessment →
        </button>
      </div>
    </div>
  );

  // ── Loading ────────────────────────────────────────────────────
  if (step === "assessing" || step === "scoring" || step === "enrolling") {
    const messages: Record<typeof step, string> = {
      assessing: "Generating assessment questions…",
      scoring: "Scoring your answers…",
      enrolling: "Creating your personalized learning plan…",
    };
    return (
      <div className={`${card} flex flex-col items-center justify-center py-16 gap-4`} style={{ background: "var(--surface)" }}>
        <Stepper current={stepIndex} />
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400">{messages[step]}</p>
      </div>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────
  if (step === "quiz" && assessment) {
    const q = assessment.questions[currentQ]!;
    const total = assessment.questions.length;
    return (
      <div className={card} style={{ background: "var(--surface)" }}>
        <Stepper current={1} />
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs text-slate-500">Question {currentQ + 1} of {total}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border border-[var(--border)] ${q.difficulty === "hard" ? "text-red-400" : q.difficulty === "easy" ? "text-emerald-400" : "text-amber-400"}`}>{q.difficulty}</span>
        </div>
        <div className="w-full h-1 rounded-full bg-[var(--border)] mb-6 overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${((currentQ + 1) / total) * 100}%` }} />
        </div>
        {q.skill_facet && <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">{q.skill_facet}</p>}
        <p className="text-sm text-white mb-5 leading-relaxed">{q.stem}</p>
        <div className="space-y-2">
          {q.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-colors ${
                answers[q.id] === opt.id
                  ? "border-violet-500 bg-violet-950/50 text-white"
                  : "border-[var(--border)] text-slate-300 hover:border-slate-600 hover:bg-white/5"
              }`}
            >
              <span className="font-medium text-slate-500 mr-2">{opt.id.toUpperCase()}.</span>
              {opt.text}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentQ((n) => Math.max(0, n - 1))}
            disabled={currentQ === 0}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            ← Back
          </button>
          {currentQ < total - 1 ? (
            <button
              onClick={() => setCurrentQ((n) => n + 1)}
              disabled={!answers[q.id]}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmitAnswers}
              disabled={assessment.questions.some((q) => !answers[q.id])}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 transition-colors"
            >
              Submit →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────
  if (step === "results" && score) {
    const R = 36; const C = 2 * Math.PI * R;
    const offset = C - (score.raw_pct / 100) * C;
    const color = score.gap_bands === 0 ? "#4ade80" : score.gap_bands <= 1 ? "#a78bfa" : "#fbbf24";

    return (
      <div className={card} style={{ background: "var(--surface)" }}>
        <Stepper current={2} />
        <h2 className="text-base font-semibold text-white mb-5">Assessment results</h2>
        <div className="flex items-center gap-6 mb-6">
          <div className="relative w-20 h-20 shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r={R} fill="none" stroke="#1E2330" strokeWidth="8" />
              <circle cx="40" cy="40" r={R} fill="none" stroke={color} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
                className="ring-progress" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white">{score.raw_pct.toFixed(0)}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-16">Your band</span>
              <span className={`text-sm font-semibold ${BAND_COLORS[score.band] ?? "text-white"}`}>{score.band}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-16">Target</span>
              <span className={`text-sm font-semibold ${BAND_COLORS[score.target_band] ?? "text-white"}`}>{score.target_band}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-16">Gap</span>
              <span className="text-sm font-semibold text-slate-300">
                {score.gap_bands === 0 ? "✓ Meets target" : `${score.gap_bands} band${score.gap_bands > 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] p-4 mb-5" style={{ background: "var(--surface-raised)" }}>
          <p className="text-xs text-slate-400 mb-1">Recommended action</p>
          <p className="text-sm text-slate-200">{score.recommended_action}</p>
          {score.suggested_goal_seed && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <p className="text-xs text-violet-400 font-medium">Suggested learning goal</p>
              <p className="text-sm text-white mt-1 font-medium">{score.suggested_goal_seed.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{score.suggested_goal_seed.summary}</p>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={() => setStep("quiz")} className="flex-1 py-2.5 rounded-lg text-sm border border-[var(--border)] text-slate-400 hover:text-white transition-colors">
            Retake
          </button>
          <button onClick={handleEnroll} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors">
            Create Learning Plan →
          </button>
        </div>
      </div>
    );
  }

  // ── Done ───────────────────────────────────────────────────────
  if (step === "done" && enrollResult) {
    return (
      <div className={card} style={{ background: "var(--surface)" }}>
        <Stepper current={3} />
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-400 text-xl">✓</span>
          </div>
          <h2 className="text-base font-semibold text-white mb-1">
            {profile.name?.split(" ")[0]} is enrolled!
          </h2>
          <p className="text-sm text-slate-500">Learning plan created. Send the claim link to get started.</p>
        </div>
        {enrollResult.demo && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-violet-950/40 border border-violet-800/40 text-xs text-violet-400 text-center">
            Demo mode — add UNFOLD_API_KEY to create real goals
          </div>
        )}
        <div className="mt-5 space-y-3">
          <div className="rounded-lg border border-[var(--border)] p-4" style={{ background: "var(--surface-raised)" }}>
            <p className="text-xs text-slate-500 mb-2">Claim link — send to {profile.email}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-cyan-400 truncate">{enrollResult.claimLink}</code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(enrollResult.claimLink)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded border border-[var(--border)] transition-colors shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
          {enrollResult.progressLink && (
            <a href={enrollResult.progressLink} target="_blank" rel="noopener noreferrer"
              className="block text-center text-xs text-violet-400 hover:text-violet-300 transition-colors">
              View progress dashboard →
            </a>
          )}
        </div>
        <button
          onClick={() => { setStep("profile"); setProfile({}); setScore(null); setAssessment(null); setAnswers({}); setEnrollResult(null); }}
          className="w-full mt-4 py-2.5 rounded-lg text-sm border border-[var(--border)] text-slate-400 hover:text-white transition-colors"
        >
          Enroll another engineer
        </button>
      </div>
    );
  }

  return null;
}

function Field({ label, type, placeholder, value, onChange }: {
  label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-slate-400 font-medium block mb-1.5">{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm text-white border border-[var(--border)] bg-[var(--surface-raised)] focus:outline-none focus:border-violet-500 placeholder-slate-600"
      />
    </div>
  );
}
