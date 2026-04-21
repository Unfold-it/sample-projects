import { EnrollFlow } from "@/components/enroll/EnrollFlow";

export default function EnrollPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white">Enroll an Engineer</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Assess skills → generate a targeted AI learning plan → send the claim link
        </p>
      </div>
      <EnrollFlow />
    </div>
  );
}
