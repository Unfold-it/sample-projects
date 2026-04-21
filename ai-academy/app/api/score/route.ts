import { NextResponse } from "next/server";
import { unfold } from "@/lib/unfold";

// Demo scoring: deterministic based on selected answers
function demoScore(answers: { question_id: string; selected_option_id: string }[]) {
  // Correct answers for demo questions: q1→c, q2→b, q3→a, q4→b, q5→a, q6→c
  const key: Record<string, string> = { q1: "c", q2: "b", q3: "a", q4: "b", q5: "a", q6: "c" };
  const weights: Record<string, number> = { q1: 1.5, q2: 1.5, q3: 1, q4: 2, q5: 1, q6: 2 };
  let rawScore = 0; const max = 9;
  const per = answers.map((a) => {
    const correct = key[a.question_id] === a.selected_option_id;
    const awarded = correct ? (weights[a.question_id] ?? 1) : 0;
    rawScore += awarded;
    return { question_id: a.question_id, correct, awarded };
  });
  const pct = (rawScore / max) * 100;
  const band = pct >= 86 ? "high" : pct >= 51 ? "medium" : pct >= 11 ? "low" : "beginner";
  const targetBand = "medium";
  const bandOrder = ["beginner", "low", "medium", "high"];
  const gap = Math.max(0, bandOrder.indexOf(targetBand) - bandOrder.indexOf(band));
  return {
    raw_score: rawScore, max_raw_score: max, raw_pct: pct,
    band, target_band: targetBand, gap_bands: gap,
    per_question: per,
    recommended_action: gap > 0 ? `Build ${band}-to-${targetBand} skills with a targeted learning path` : "Excellent — you meet the target proficiency",
    suggested_goal_seed: gap > 0 ? {
      title: `RAG & LLM Integration Mastery — Closing the Gap to ${targetBand.charAt(0).toUpperCase() + targetBand.slice(1)}`,
      summary: `Targeted plan focusing on the sub-skills where you scored below target: reranking, hallucination mitigation, and evaluation pipelines.`,
      skill_focus: "RAG & Retrieval",
      target_proficiency: targetBand,
    } : null,
    demo: true,
  };
}

export async function POST(req: Request) {
  const body = await req.json() as {
    assessment_token: string;
    answers: { question_id: string; selected_option_id: string }[];
  };

  if (!process.env.UNFOLD_API_KEY || body.assessment_token.startsWith("demo_token_")) {
    return NextResponse.json(demoScore(body.answers));
  }

  try {
    const result = await unfold.scoreAssessment({
      assessment_token: body.assessment_token,
      answers: body.answers,
      request_id: `score-${Date.now()}`,
    });
    return NextResponse.json({ ...result, demo: false });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
