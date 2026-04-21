import { NextResponse } from "next/server";
import { unfold } from "@/lib/unfold";

const DEMO_QUESTIONS = [
  { id: "q1", stem: "Which chunking strategy best preserves semantic meaning for a technical documentation corpus?", options: [{ id: "a", text: "Fixed-size character chunking (512 chars)" }, { id: "b", text: "Recursive text splitting with overlap" }, { id: "c", text: "Sentence-boundary splitting with semantic grouping" }, { id: "d", text: "Paragraph-level splitting by newlines" }], difficulty: "medium", skill_facet: "Chunking Strategy", score_weight: 1.5 },
  { id: "q2", stem: "What is the primary purpose of re-ranking in a RAG pipeline?", options: [{ id: "a", text: "To reduce the number of chunks stored in the vector DB" }, { id: "b", text: "To improve retrieval precision by scoring candidates with a cross-encoder" }, { id: "c", text: "To increase embedding speed during indexing" }, { id: "d", text: "To compress retrieved context before sending to the LLM" }], difficulty: "medium", skill_facet: "Retrieval Quality", score_weight: 1.5 },
  { id: "q3", stem: "When using the Anthropic Messages API, which parameter controls the maximum number of tokens generated?", options: [{ id: "a", text: "max_tokens" }, { id: "b", text: "token_limit" }, { id: "c", text: "output_length" }, { id: "d", text: "generation_budget" }], difficulty: "easy", skill_facet: "API Basics", score_weight: 1 },
  { id: "q4", stem: "Which evaluation metric is most appropriate for assessing hallucination in RAG systems?", options: [{ id: "a", text: "BLEU score against a reference corpus" }, { id: "b", text: "Faithfulness — does the answer follow from retrieved context?" }, { id: "c", text: "Perplexity of the generated response" }, { id: "d", text: "Response length relative to context length" }], difficulty: "hard", skill_facet: "Evaluation Pipelines", score_weight: 2 },
  { id: "q5", stem: "In a streaming LLM response, what event type signals the end of the stream?", options: [{ id: "a", text: "data: [DONE]" }, { id: "b", text: "event: close" }, { id: "c", text: "data: {status: 'complete'}" }, { id: "d", text: "The connection closes with HTTP 204" }], difficulty: "easy", skill_facet: "Streaming", score_weight: 1 },
  { id: "q6", stem: "Which approach most effectively mitigates prompt injection in a RAG system where user queries are combined with retrieved docs?", options: [{ id: "a", text: "Escaping all angle brackets in retrieved content" }, { id: "b", text: "Instructing the model in the system prompt to ignore instructions in retrieved content" }, { id: "c", text: "Separating retrieved context and user queries with explicit XML-style tags and reinforcing role boundaries" }, { id: "d", text: "Limiting retrieved document length to under 500 tokens" }], difficulty: "hard", skill_facet: "Security", score_weight: 2 },
];

export async function POST(req: Request) {
  const body = await req.json() as {
    skill: string; role: string; techStack: string[]; targetProficiency: string;
    projectTitle?: string;
  };

  if (!process.env.UNFOLD_API_KEY) {
    return NextResponse.json({
      assessment_token: "demo_token_" + Date.now(),
      questions: DEMO_QUESTIONS,
      band_map: { beginner: [0, 10], low: [11, 50], medium: [51, 85], high: [86, 100] },
      max_raw_score: 9,
      target_band: body.targetProficiency,
      model_meta: { provider: "demo", model_id: "demo", generated_at: new Date().toISOString() },
      demo: true,
    });
  }

  try {
    const result = await unfold.generateAssessment({
      work_item_context: {
        title: body.projectTitle ?? "RAG Knowledge Base Agent",
        description: `Role: ${body.role}. Tech stack: ${body.techStack.join(", ")}.`,
        domain_tags: [body.skill, ...body.techStack.slice(0, 2)],
      },
      skill: body.skill,
      target_proficiency: body.targetProficiency as "beginner" | "low" | "medium" | "high",
      num_questions: 6,
      difficulty_mix: { easy: 0.33, medium: 0.34, hard: 0.33 },
      request_id: `web-${body.role}-${Date.now()}`,
    });
    return NextResponse.json({ ...result, demo: false });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
