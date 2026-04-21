import { NextResponse } from "next/server";
import { unfold } from "@/lib/unfold";
import { DEMO_GOALS } from "@/lib/demo-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cohort = searchParams.get("cohort") ?? undefined;
  const inactiveDays = searchParams.get("inactiveDays") ? Number(searchParams.get("inactiveDays")) : undefined;

  if (!process.env.UNFOLD_API_KEY) {
    return NextResponse.json({ ...DEMO_GOALS, demo: true });
  }

  try {
    const result = await unfold.listGoals({
      metadata: cohort ? [`cohort=${cohort}`] : undefined,
      inactiveDays,
      limit: 50,
    });
    return NextResponse.json({ ...result, demo: false });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
