import { NextResponse } from "next/server";
import { unfold } from "@/lib/unfold";

const DEMO_QUESTIONS = [
  {
    id: "cq1",
    text: "What is your primary learning objective for this skill gap?",
    type: "text",
    agentAnswer: "Close the identified proficiency gap and reach the target band required for this work item",
    agentConfidence: "high",
  },
  {
    id: "cq2",
    text: "How much time can you commit to learning each week?",
    type: "options",
    options: ["1–2 hours", "3–5 hours", "5–10 hours", "10+ hours"],
    agentAnswer: "3–5 hours",
    agentConfidence: "medium",
  },
  {
    id: "cq3",
    text: "Do you prefer hands-on coding exercises or conceptual reading?",
    type: "options",
    options: ["Mostly coding", "Mix of both", "Mostly reading/videos"],
    agentAnswer: "Mix of both",
    agentConfidence: "medium",
  },
];

export async function POST(req: Request) {
  const body = await req.json() as {
    name: string; email: string; role: string; track: string;
    techStack: string[]; experienceLevel: string;
    assessedBand?: string; assessmentScore?: number; assessmentGap?: number;
    goalTitle?: string; goalSummary?: string;
    skillDescription?: string; skillFacts?: string[];
    workItemTitle?: string; workItemDescription?: string;
  };

  if (!process.env.UNFOLD_API_KEY) {
    return NextResponse.json({
      goalId: "g-demo-" + Date.now(),
      claimLink: "https://app.unfoldit.com/claim/demo-abc123",
      progressLink: "https://app.unfoldit.com/progress/demo-abc123",
      planGenerationStatus: "pending_clarification",
      status: "draft",
      questions: DEMO_QUESTIONS,
      demo: true,
    });
  }

  try {
    const title = body.goalTitle ?? `${body.role} AI Skills — ${body.name}`;

    // Build additionalNotes with everything that doesn't fit a named UnfoldContext field.
    // These become "EXPLICIT CONTEXT" in the clarification agent prompt, so the more
    // specific this is, the higher confidence the agent can answer the questions.
    const noteParts = [
      body.assessmentScore != null
        ? `Assessment result: scored ${body.assessmentScore.toFixed(0)}% — current proficiency is "${body.assessedBand}", target is "${body.experienceLevel}". Gap: ${body.assessmentGap} band(s).`
        : null,
      body.skillDescription
        ? `Skill focus: ${body.skillDescription}`
        : null,
      body.skillFacts?.length
        ? `Technical constraints for this skill: ${body.skillFacts.join("; ")}.`
        : null,
      body.workItemTitle
        ? `Assigned work item: "${body.workItemTitle}".`
        : null,
      body.workItemDescription
        ? `Work item detail: ${body.workItemDescription}`
        : null,
    ].filter(Boolean);

    const result = await unfold.createGoal({
      title,
      description: body.goalSummary ?? `AI readiness learning plan for ${body.name} (${body.role})`,
      context: {
        techStack: body.techStack,
        experienceLevel: body.assessedBand ?? body.experienceLevel,
        timeline: "6 weeks",
        successCriteria: `${body.name} (${body.role}) reaches the required proficiency band in ${body.goalTitle?.split("—")[0]?.trim() ?? "the target skill"} to complete the assigned work item.`,
        constraints: `Role: ${body.role}. Stack: ${body.techStack.join(", ")}. Track: ${body.track}.`,
        additionalNotes: noteParts.length ? noteParts.join(" ") : undefined,
      },
      autoRespond: false,
      goalContext: "professional",
      priority: (body.assessmentGap ?? 0) >= 2 ? "high" : "medium",
      claimExpiresInDays: 14,
      progressShare: true,
      metadata: {
        cohort: "spring-2026",
        track: body.track,
        role: body.role,
        project: "rag-knowledge-base",
        learner_email: body.email,
        assessed_band: body.assessedBand ?? body.experienceLevel,
        assessment_score: body.assessmentScore?.toFixed(0) ?? "0",
      },
    });
    return NextResponse.json({ ...result, demo: false });
  } catch (err) {
    // Fall back to demo on error
    return NextResponse.json({
      goalId: "g-demo-" + Date.now(),
      claimLink: "https://app.unfoldit.com/claim/demo-abc123",
      progressLink: "https://app.unfoldit.com/progress/demo-abc123",
      planGenerationStatus: "pending_clarification",
      status: "draft",
      questions: DEMO_QUESTIONS,
      demo: true,
      error: (err as Error).message,
    });
  }
}
