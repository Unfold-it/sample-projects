"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/",          label: "Dashboard",  icon: GridIcon,   section: "admin" },
  { href: "/learners",  label: "Learners",   icon: UsersIcon,  section: "admin" },
  { href: "/insights",  label: "Insights",   icon: SparkIcon,  section: "admin" },
  { href: "/enroll",    label: "Enroll",     icon: PlusIcon,   section: "admin" },
  { href: "/my-work",   label: "My Work",    icon: MyWorkIcon, section: "learner" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-[var(--border)]" style={{ background: "#0A0C11" }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border)]">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-white leading-none">Unfold</div>
          <div className="text-[10px] text-slate-500 mt-0.5">AI Teams</div>
        </div>
      </div>

      {/* Cohort badge */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--surface)" }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium truncate">spring-2026</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {/* Admin section */}
        <div className="px-2 pb-1">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Academy Admin</span>
        </div>
        {nav.filter(n => n.section === "admin").map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-violet-400" : ""}`} />
              {label}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-2 border-t border-[var(--border)]" />

        {/* Learner section */}
        <div className="px-2 pb-1">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Learner</span>
        </div>
        {nav.filter(n => n.section === "learner").map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-violet-400" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Docs link */}
      <div className="px-3 pb-4">
        <a
          href="https://docs.unfoldit.com/mcp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors hover:bg-white/5"
        >
          <BookIcon className="w-4 h-4 shrink-0" />
          MCP Docs
        </a>
      </div>
    </aside>
  );
}

// ── Inline icons ──────────────────────────────────────────────────

function GridIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
}
function UsersIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}><path strokeLinecap="round" d="M16 11c1.656 0 3 1.344 3 3v1h2v-1c0-2.21-1.79-4-4-4"/><path strokeLinecap="round" d="M10 11c2.21 0 4 1.79 4 4v1H6v-1c0-2.21 1.79-4 4-4z"/><circle cx="10" cy="7" r="2.5"/><circle cx="16" cy="7" r="2.5"/></svg>;
}
function SparkIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>;
}
function PlusIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>;
}
function BookIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}><path strokeLinecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>;
}
function MyWorkIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/></svg>;
}
