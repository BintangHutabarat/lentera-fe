"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, Lock } from "lucide-react";
import {
  getMeetingAttendance,
  updateMeetingAttendance,
  closeMeeting,
} from "@/lib/services/teacher";
import type { AttendanceStatus, MeetingAttendance } from "@/lib/services/teacher";

const STATUS_OPTIONS: { key: AttendanceStatus; label: string; color: string; bg: string; activeBg: string }[] = [
  { key: "HADIR", label: "H",     color: "text-brand-teal",  bg: "bg-surface-soft",  activeBg: "bg-teal-light" },
  { key: "SAKIT", label: "S",     color: "text-brand-blue",  bg: "bg-surface-soft",  activeBg: "bg-blue-light" },
  { key: "IZIN",  label: "I",     color: "text-yellow-dark", bg: "bg-surface-soft",  activeBg: "bg-yellow-light" },
  { key: "ALPHA", label: "A",     color: "text-red-dark",    bg: "bg-surface-soft",  activeBg: "bg-red-light" },
];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export default function TeacherMeetingAttendancePage() {
  const { id: classSubjectId, meetingId } = useParams<{ id: string; meetingId: string }>();
  const router = useRouter();

  const [data, setData] = useState<MeetingAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    getMeetingAttendance(meetingId)
      .then((res) => {
        setData(res);
        const initial: Record<string, AttendanceStatus> = {};
        res.entries.forEach((e) => { initial[e.studentId] = e.status; });
        setStatuses(initial);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [meetingId]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    try {
      const entries = Object.entries(statuses).map(([studentId, status]) => ({ studentId, status }));
      await updateMeetingAttendance(meetingId, entries);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      /* silent */
    }
    setSaving(false);
  };

  const handleClose = async () => {
    if (!confirm("Tutup pertemuan ini? Absensi tidak bisa diubah setelah ditutup.")) return;
    setClosing(true);
    try {
      await handleSave();
      await closeMeeting(meetingId);
      setData((prev) => prev ? { ...prev, meeting: { ...prev.meeting, status: "CLOSED" } } : prev);
    } catch {
      /* silent */
    }
    setClosing(false);
  };

  const isOpen = data?.meeting.status === "OPEN";

  const summary = Object.values(statuses).reduce<Record<AttendanceStatus, number>>(
    (acc, s) => { acc[s] = (acc[s] ?? 0) + 1; return acc; },
    { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 }
  );

  return (
    <>
      <header className="bg-surface-card border-b border-border px-3.5 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-surface-soft transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-extrabold text-ink">
            Pertemuan {data?.meeting.meetingNumber ?? "—"}
          </h3>
          {data && <p className="text-[11px] text-ink-muted truncate">{formatDate(data.meeting.startedAt)}</p>}
        </div>
        {!isOpen && (
          <div className="flex items-center gap-1 text-ink-muted text-[10px] font-bold">
            <Lock size={12} /> Ditutup
          </div>
        )}
      </header>

      <div className="px-3.5 pt-3.5 pb-32">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
        ) : !data ? null : (
          <>
            {/* Summary chips */}
            <div className="grid grid-cols-4 gap-2 mb-3.5">
              {STATUS_OPTIONS.map(({ key, label, activeBg, color }) => (
                <div key={key} className={`card p-2.5 text-center ${activeBg}`}>
                  <div className={`text-[18px] font-extrabold ${color}`}>{summary[key]}</div>
                  <div className="text-[9px] font-bold text-ink-muted mt-0.5">{key}</div>
                </div>
              ))}
            </div>

            {/* Student list */}
            <div className="card">
              {data.entries.map((entry, i) => (
                <div
                  key={entry.studentId}
                  className={`flex items-center gap-3 px-4 py-2.5 ${i < data.entries.length - 1 ? "border-b border-surface-soft" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink truncate">{entry.name}</div>
                    <div className="text-[10px] text-ink-muted">NIS: {entry.nis}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {STATUS_OPTIONS.map(({ key, label, color, bg, activeBg }) => {
                      const active = statuses[entry.studentId] === key;
                      return (
                        <button
                          key={key}
                          onClick={() => isOpen && setStatuses((prev) => ({ ...prev, [entry.studentId]: key }))}
                          disabled={!isOpen}
                          className={`w-7 h-7 rounded-full text-[11px] font-extrabold transition-colors ${
                            active ? `${activeBg} ${color}` : `${bg} text-ink-muted`
                          } ${isOpen ? "cursor-pointer" : "cursor-default"}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom actions */}
      {data && isOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border px-3.5 py-3 flex gap-2.5"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-12 rounded-[12px] bg-surface-soft text-ink text-[13px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle2 size={15} className="text-brand-teal" /> : null}
            {saving ? "Menyimpan..." : saved ? "Tersimpan" : "Simpan"}
          </button>
          <button
            onClick={handleClose}
            disabled={closing}
            className="flex-1 h-12 rounded-[12px] bg-red-dark text-white text-[13px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {closing ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            {closing ? "Menutup..." : "Tutup Pertemuan"}
          </button>
        </div>
      )}
    </>
  );
}
