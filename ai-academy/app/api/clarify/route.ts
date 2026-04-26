import { NextResponse } from "next/server";
import { unfold } from "@/lib/unfold";

export async function POST(req: Request) {
  const body = await req.json() as {
    goalId: string;
    answers?: Record<string, string>;
    acceptAgentAnswers?: boolean;
    demo?: boolean;
  };

  if (!process.env.UNFOLD_API_KEY || body.demo) {
    return NextResponse.json({
      goalId: body.goalId,
      status: "in_progress",
      planGenerationStatus: "generating",
      demo: true,
    });
  }

  try {
    const result = await unfold.submitClarification(body.goalId, {
      answers: body.answers,
      acceptAgentAnswers: body.acceptAgentAnswers ?? true,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
