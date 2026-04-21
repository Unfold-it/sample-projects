import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Unfold AI Teams — AI Academy",
  description: "Train your engineers on AI. See who's learning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDemo = !process.env.UNFOLD_API_KEY;

  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden" style={{ background: "var(--page-bg)" }}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {isDemo && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium bg-violet-950/60 border-b border-violet-800/40 text-violet-300">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Demo Mode — showing sample data.&nbsp;
              <span className="text-violet-400">Add UNFOLD_API_KEY to .env.local for live data.</span>
            </div>
          )}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
