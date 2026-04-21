"use client";
import { useEffect, useRef } from "react";

export function HealthScoreRing({ score }: { score: number }) {
  const R = 44;
  const C = 2 * Math.PI * R;
  const offset = C - (score / 100) * C;
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#a78bfa" : score >= 30 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={R} fill="none" stroke="#1E2330" strokeWidth="10" />
        <circle
          cx="56" cy="56" r={R} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          className="ring-progress"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white leading-none">{score}</span>
        <span className="text-[10px] text-slate-500 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}
