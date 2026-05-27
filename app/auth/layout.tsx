import Link from "next/link";
import { Lightbulb } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-surface-page">
      <header className="border-b border-border bg-surface-card/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ background: "var(--brand-grad)" }}
            >
              <Lightbulb size={18} className="text-white" fill="rgba(255,255,255,0.9)" />
            </div>
            <span className="text-[17px] font-extrabold text-ink tracking-tight">Lentera</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
