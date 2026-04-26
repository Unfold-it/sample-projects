import { NextResponse } from "next/server";
import { unfold } from "@/lib/unfold";

export async function GET() {
  if (!process.env.UNFOLD_API_KEY) {
    return NextResponse.json({
      schema_version: "v1",
      supported_languages: ["en"],
      min_questions: 3,
      max_questions: 20,
      supported_proficiency_bands: ["beginner", "low", "medium", "high"],
      default_band_thresholds: { beginner: [0, 10], low: [11, 50], medium: [51, 85], high: [86, 100] },
      default_difficulty_mix: { easy: 0.33, medium: 0.34, hard: 0.33 },
      open_domain: true,
      token_ttl_seconds: 86400,
      demo: true,
    });
  }

  try {
    const result = await unfold.getCapabilities();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
