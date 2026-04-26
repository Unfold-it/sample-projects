import { NextResponse } from "next/server";
import { unfold } from "@/lib/unfold";

export async function POST(req: Request) {
  const body = await req.json() as {
    title: string; description?: string;
    steps: { title: string; description?: string; substeps?: { title: string; description?: string; type?: string }[] }[];
    priority?: string;
  };

  if (!process.env.UNFOLD_API_KEY) {
    return NextResponse.json({
      goalId: "g-import-demo-" + Date.now(),
      status: "in_progress",
      planGenerationStatus: "completed",
      claimLink: "https://app.unfoldit.com/claim/demo-import",
      progressLink: "https://app.unfoldit.com/progress/demo-import",
      steps: body.steps.map((s, i) => ({
        title: s.title,
        description: s.description,
        order: i + 1,
        isCriticalPath: i < Math.ceil(body.steps.length / 2),
        isQuickWin: i === body.steps.length - 1,
        complexity: ["low", "medium", "high"][i % 3],
        duration: ["1 day", "2 days", "3 days", "2 days"][i % 4],
      })),
      demo: true,
    });
  }

  try {
    const result = await unfold.importPlan(body);
    return NextResponse.json({ ...result, demo: false });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
