import { Zap } from "lucide-react";
import type { Student } from "@/types";
import { ProgressBar } from "./ProgressBar";

interface XPBarProps {
  student: Student;
}

export function XPBar({ student }: XPBarProps) {
  const pct = Math.round((student.xp / student.xpMax) * 100);

  return (
    <div className="card p-4 mb-3.5">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[13px] font-extrabold text-ink flex items-center gap-1">
          <Zap size={13} className="fill-brand-yellow text-brand-yellow" />
          Level {student.level} — Pelajar Aktif
        </span>
        <span className="text-[11px] text-ink-muted">
          {student.xp.toLocaleString()} / {student.xpMax.toLocaleString()} XP
        </span>
      </div>

      <ProgressBar value={pct} height="lg" className="mb-2.5" />

      <div className="flex gap-1.5 flex-wrap">
        {student.badges.map((b) => (
          <span
            key={b.id}
            className={
              b.earned
                ? "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-light text-yellow-dark"
                : "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-soft text-ink-muted"
            }
          >
            {b.icon} {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
