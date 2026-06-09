"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { getStudentAttendance } from "@/lib/services/subjects";
import type { StudentAttendance, StudentAttendanceStatus } from "@/lib/services/subjects";

const STATUS_CONFIG: Record<StudentAttendanceStatus, { label: string; color: string; bg: string }> = {
  HADIR: { label: "Hadir",    color: "text-brand-teal",  bg: "bg-teal-light" },
  SAKIT: { label: "Sakit",    color: "text-brand-blue",  bg: "bg-blue-light" },
  IZIN:  { label: "Izin",     color: "text-yellow-dark", bg: "bg-yellow-light" },
  ALPHA: { label: "Alpha",    color: "text-red-dark",    bg: "bg-red-light" },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export default function StudentAbsensiPage() {
  const { id: classSubjectId } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<StudentAttendance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentAttendance(classSubjectId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classSubjectId]);

  return (
    <>
      <header className="bg-surface-card border-b border-border px-[18px] py-[13px] flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-[9px] flex items-center justify-center text-ink-muted hover:bg-surface-soft transition-colors cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-extrabold text-ink truncate">
            Rekap Absensi{data ? ` · ${data.subject.name}` : ""}
          </h3>
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-[13px] text-ink-muted">Gagal memuat absensi.</p>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="card p-4 mb-3.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-extrabold text-ink">Kehadiran</span>
                <span className="text-[13px] font-extrabold text-brand-blue">
                  {data.summary.percentageHadir != null ? `${data.summary.percentageHadir.toFixed(1)}%` : "—"}
                </span>
              </div>
              {data.summary.percentageHadir != null && (
                <div className="h-2 bg-surface-soft rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-brand-teal rounded-full transition-all"
                    style={{ width: `${data.summary.percentageHadir}%` }}
                  />
                </div>
              )}
              <div className="grid grid-cols-4 gap-2">
                {(["HADIR", "SAKIT", "IZIN", "ALPHA"] as const).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <div key={s} className={`rounded-[10px] p-2 text-center ${cfg.bg}`}>
                      <div className={`text-[18px] font-extrabold ${cfg.color}`}>{data.summary[s.toLowerCase() as keyof typeof data.summary] as number}</div>
                      <div className="text-[9px] font-bold text-ink-muted mt-0.5">{s}</div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-ink-muted mt-2.5 text-center">
                {data.summary.total} dari {data.totalMeetings} pertemuan tercatat
              </p>
            </div>

            {/* Per-meeting breakdown */}
            <h3 className="text-[13px] font-extrabold text-ink mb-2.5">Riwayat Pertemuan</h3>
            {data.meetings.length === 0 ? (
              <div className="card p-4 text-center text-[12px] text-ink-muted">
                Belum ada pertemuan.
              </div>
            ) : (
              <div className="card mb-3.5">
                {data.meetings.map((m, i) => {
                  const cfg = m.status ? STATUS_CONFIG[m.status] : null;
                  return (
                    <div
                      key={m.meetingId}
                      className={`flex items-center gap-3 px-4 py-3 ${i < data.meetings.length - 1 ? "border-b border-surface-soft" : ""}`}
                    >
                      <div className="w-9 h-9 rounded-[10px] bg-surface-soft flex items-center justify-center text-[12px] font-extrabold text-ink flex-shrink-0">
                        {m.meetingNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-ink">Pertemuan {m.meetingNumber}</div>
                        <div className="text-[10px] text-ink-muted mt-0.5">{formatDate(m.date)}</div>
                      </div>
                      {cfg ? (
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-ink-muted">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
