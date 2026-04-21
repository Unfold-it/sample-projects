import { NextResponse } from "next/server";
import { unfold } from "@/lib/unfold";
import { DEMO_ANALYTICS, DEMO_BY_TRACK } from "@/lib/demo-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupBy = searchParams.get("groupBy") ?? undefined;
  const cohort  = searchParams.get("cohort")  ?? undefined;

  if (!process.env.UNFOLD_API_KEY) {
    return NextResponse.json({ analytics: DEMO_ANALYTICS, byTrack: DEMO_BY_TRACK, demo: true });
  }

  try {
    const [analytics, byTrack] = await Promise.all([
      unfold.getAnalytics({ metadata: cohort ? { cohort } : undefined, inactiveDays: 7, includeFunnel: true }),
      unfold.getAnalytics({ metadata: cohort ? { cohort } : undefined, groupBy: groupBy ?? "track", includeFunnel: false }),
    ]);
    return NextResponse.json({ analytics, byTrack, demo: false });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
