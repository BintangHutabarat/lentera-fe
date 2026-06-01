"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { getWeekSchedule } from "@/lib/services/schedule";
import { subjectColorMap } from "@/lib/utils";
import type { WeekSchedule, ScheduleLesson } from "@/lib/services/schedule";

const DAY_LABELS: { key: keyof WeekSchedule; label: string; short: string }[] = [
  { key: "monday",    label: "Senin",  short: "Sen" },
  { key: "tuesday",   label: "Selasa", short: "Sel" },
  { key: "wednesday", label: "Rabu",   short: "Rab" },
  { key: "thursday",  label: "Kamis",  short: "Kam" },
  { key: "friday",    label: "Jumat",  short: "Jum" },
  { key: "saturday",  label: "Sabtu",  short: "Sab" },
];

function todayKey(): keyof WeekSchedule {
  const map: Record<number, keyof WeekSchedule> = {
    1: "monday", 2: "tuesday", 3: "wednesday",
    4: "thursday", 5: "friday", 6: "saturday",
  };
  return map[new Date().getDay()] ?? "monday";
}

export default function JadwalPage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<keyof WeekSchedule>(todayKey());

  useEffect(() => {
    getWeekSchedule()
      .then(setSchedule)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const lessons: ScheduleLesson[] = schedule?.[activeDay] ?? [];

  return (
    <>
      {/* Topbar */}
      <header className="bg-surface-card border-b border-border px-[18px] py-[13px] flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-[9px] flex items-center justify-center text-ink-muted hover:bg-surface-soft transition-colors cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-extrabold text-ink">Jadwal Mingguan</h3>
          <p className="text-[11px] text-ink-muted mt-0.5">Jadwal pelajaran minggu ini</p>
        </div>
      </header>

      {/* Day tabs */}
      <div className="bg-surface-card border-b border-border px-3.5 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {DAY_LABELS.map(({ key, short, label }) => {
          const isToday = key === todayKey();
          const isActive = key === activeDay;
          return (
            <button
              key={key}
              onClick={() => setActiveDay(key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-brand-blue text-white"
                  : "bg-surface-soft text-ink-muted hover:bg-surface-card"
              }`}
            >
              {short}
              {isToday && (
                <span className={`ml-1 inline-block w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-brand-blue"}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-3.5 pt-3.5">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
            Memuat...
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center mb-4">
              <Calendar size={28} className="text-ink-muted" />
            </div>
            <h3 className="text-[15px] font-extrabold text-ink mb-2">Tidak ada jadwal</h3>
            <p className="text-[12px] text-ink-muted">
              Tidak ada pelajaran hari{" "}
              {DAY_LABELS.find((d) => d.key === activeDay)?.label ?? "ini"}.
            </p>
          </div>
        ) : (
          <div className="card mb-3.5">
            {lessons.map((lesson, i) => {
              const c = subjectColorMap[lesson.subject.color];
              return (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    i < lessons.length - 1 ? "border-b border-surface-soft" : ""
                  }`}
                >
                  <div className="min-w-[48px] text-center">
                    <div className="text-[11px] font-extrabold text-brand-blue leading-tight">
                      {lesson.timeStart}
                    </div>
                    <div className="text-[9px] text-ink-muted leading-tight mt-0.5">
                      {lesson.timeEnd}
                    </div>
                  </div>
                  <div
                    className="w-0.5 self-stretch rounded-full flex-shrink-0"
                    style={{ background: c.bar }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold text-ink">{lesson.subject.name}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5">{lesson.room}</div>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: c.bar }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
