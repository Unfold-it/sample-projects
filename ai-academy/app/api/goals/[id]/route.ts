import { NextResponse } from "next/server";
import { unfold } from "@/lib/unfold";
import type { StepStatus } from "@/lib/types";

function mapStep(s: StepStatus, i: number) {
  return {
    title: s.title,
    description: s.description ?? null,
    order: s.order ?? i + 1,
    isCriticalPath: s.isCriticalPath ?? false,
    isQuickWin: s.isQuickWin ?? false,
    complexity: s.complexity ?? null,
    duration: s.durationEstimate ?? null,
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!process.env.UNFOLD_API_KEY || id.startsWith("g-demo-")) {
    return NextResponse.json({
      goalId: id,
      planGenerationStatus: "completed",
      status: "in_progress",
      progress: { totalSteps: 6, completedSteps: 0, inProgressSteps: 0, blockedSteps: 0, overallPercent: 0 },
      claimLink: "https://app.unfoldit.com/claim/demo-abc123",
      progressLink: "https://app.unfoldit.com/progress/demo-abc123",
      steps: [
        { title: "Assess current RAG baseline", order: 1, isCriticalPath: true, isQuickWin: true, complexity: "low", duration: "1 day" },
        { title: "Implement chunking & embedding pipeline", order: 2, isCriticalPath: true, isQuickWin: false, complexity: "high", duration: "3 days" },
        { title: "Add cross-encoder re-ranking", order: 3, isCriticalPath: true, isQuickWin: false, complexity: "medium", duration: "2 days" },
        { title: "Set up hallucination evaluation", order: 4, isCriticalPath: false, isQuickWin: false, complexity: "medium", duration: "2 days" },
        { title: "Wire citation extraction via tool use", order: 5, isCriticalPath: false, isQuickWin: false, complexity: "medium", duration: "1 day" },
        { title: "Load-test to p95 latency budget", order: 6, isCriticalPath: false, isQuickWin: true, complexity: "low", duration: "1 day" },
      ],
      demo: true,
    });
  }

  try {
    const result = await unfold.getGoal(id);
    return NextResponse.json({
      goalId: result.goalId,
      planGenerationStatus: result.planGenerationStatus,
      status: result.status,
      progress: result.progress,
      claimLink: null,
      progressLink: result.progressLink ?? null,
      steps: (result.steps ?? []).map(mapStep),
      demo: false,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
