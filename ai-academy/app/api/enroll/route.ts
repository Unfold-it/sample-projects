import { NextResponse } from "next/server";
import { unfold } from "@/lib/unfold";

export async function POST(req: Request) {
  const body = await req.json() as {
    name: string; email: string; role: string; track: string;
    techStack: string[]; experienceLevel: string;
    assessedBand?: string; assessmentScore?: number; assessmentGap?: number;
    goalTitle?: string; goalSummary?: string;
  };

  if (!process.env.UNFOLD_API_KEY) {
    // Demo mode — return a fake but realistic goal
    return NextResponse.json({
      goalId: "g-demo-" + Date.now(),
      claimLink: "https://app.unfoldit.com/claim/demo-abc123",
      progressLink: "https://app.unfoldit.com/progress/demo-abc123",
      planGenerationStatus: "generating",
      status: "draft",
      demo: true,
    });
  }

  try {
    const title = body.goalTitle ?? `${body.role} AI Skills — ${body.name}`;
    const result = await unfold.createGoal({
      title,
      description: body.goalSummary ?? `AI readiness learning plan for ${body.name} (${body.role})`,
      context: {
        tech_stack: body.techStack,
        experience_level: body.assessedBand ?? body.experienceLevel,
        timeline: "6 weeks",
        success_criteria: `Reach medium proficiency in AI skills relevant to the ${body.role} role`,
        additional_notes: body.assessmentScore
          ? `Assessment: ${body.assessmentScore.toFixed(0)}% (${body.assessedBand}). Gap: ${body.assessmentGap} band(s).`
          : undefined,
      },
      autoRespond: true,
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
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
