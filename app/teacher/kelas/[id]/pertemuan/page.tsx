"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, CheckCircle2, ChevronRight,
  Loader2, Lock, Plus, Users,
} from "lucide-react";
import {
  getMeetings,
  openMeeting,
  getTeacherClassSubjects,
} from "@/lib/services/teacher";
import type { MeetingListItem, MeetingsResponse } from "@/lib/services/teacher";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export default function TeacherPertemuanPage() {
  const { id: classSubjectId } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<MeetingsResponse | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMeetings(classSubjectId), getTeacherClassSubjects()])
      .then(([mtg, subjects]) => {
        setData(mtg);
        const cs = subjects.find((s) => s.id === classSubjectId);
        if (cs) setSubjectName(`${cs.subject.name} · ${cs.class.name}`);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classSubjectId]);

  const hasOpenMeeting = data?.meetings.some((m) => m.status === "OPEN") ?? false;
  const reachedLimit = data ? data.meetings.length >= data.totalMeetings : false;

  const handleOpen = async () => {
    if (opening || hasOpenMeeting || reachedLimit) return;
    setOpening(true);
    setOpenError(null);
    try {
      const newMeeting = await openMeeting(classSubjectId);
      setData((prev) => prev
        ? { ...prev, meetings: [newMeeting, ...prev.meetings] }
        : { totalMeetings: 1, meetings: [newMeeting] }
      );
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === "MEETING_ALREADY_OPEN") setOpenError("Masih ada pertemuan yang belum ditutup.");
      else if (code === "MEETING_LIMIT_REACHED") setOpenError("Jumlah pertemuan sudah mencapai batas.");
      else setOpenError("Gagal membuka pertemuan.");
    }
    setOpening(false);
  };

  const statusOf = (m: MeetingListItem) =>
    m.status === "OPEN"
      ? { label: "Berlangsung", color: "text-brand-teal", bg: "bg-teal-light" }
      : { label: "Selesai", color: "text-ink-muted", bg: "bg-surface-soft" };

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
          <h3 className="text-[14px] font-extrabold text-ink">Pertemuan & Absensi</h3>
          {subjectName && <p className="text-[11px] text-ink-muted truncate">{subjectName}</p>}
        </div>
      </header>

      <div className="px-3.5 pt-3.5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">Memuat...</div>
        ) : !data ? null : (
          <>
            {/* Progress */}
            <div className="card p-4 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-extrabold text-ink">Progress Pertemuan</span>
                <span className="text-[12px] font-extrabold text-brand-blue">
                  {data.meetings.filter((m) => m.status === "CLOSED").length} / {data.totalMeetings}
                </span>
              </div>
              <div className="h-2 bg-surface-soft rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-blue rounded-full transition-all"
                  style={{ width: `${Math.min(100, (data.meetings.filter((m) => m.status === "CLOSED").length / data.totalMeetings) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-ink-muted mt-1.5">
                {data.meetings.length} pertemuan dibuka · {data.totalMeetings} total
              </p>
            </div>

            {/* Open meeting button */}
            <button
              onClick={handleOpen}
              disabled={opening || hasOpenMeeting || reachedLimit}
              className="w-full h-12 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed mb-3.5 transition-opacity"
            >
              {opening ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {opening ? "Membuka..." : "Buka Pertemuan Baru"}
            </button>
            {hasOpenMeeting && (
              <p className="text-[11px] text-ink-muted text-center -mt-2.5 mb-3.5">
                Tutup pertemuan yang sedang berlangsung dulu.
              </p>
            )}
            {openError && (
              <p className="text-[11px] text-red-dark font-bold text-center -mt-2.5 mb-3.5">{openError}</p>
            )}

            {/* Meetings list */}
            {data.meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center mb-3">
                  <Calendar size={20} className="text-ink-muted" />
                </div>
                <p className="text-[13px] font-bold text-ink">Belum ada pertemuan</p>
                <p className="text-[11px] text-ink-muted mt-1">Buka pertemuan pertama di atas.</p>
              </div>
            ) : (
              <div className="card">
                {data.meetings.map((m, i) => {
                  const s = statusOf(m);
                  return (
                    <Link
                      key={m.id}
                      href={`/teacher/kelas/${classSubjectId}/pertemuan/${m.id}`}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-soft transition-colors ${
                        i < data.meetings.length - 1 ? "border-b border-surface-soft" : ""
                      }`}
                    >
                      <div className="w-9 h-9 rounded-[10px] bg-surface-soft flex items-center justify-center text-[12px] font-extrabold text-ink flex-shrink-0">
                        {m.meetingNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-ink">Pertemuan {m.meetingNumber}</div>
                        <div className="text-[10px] text-ink-muted mt-0.5">{formatDate(m.startedAt)}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-ink-muted">
                          <Users size={11} />
                          <span className="text-[10px]">{m.studentCount}</span>
                        </div>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                          {s.label}
                        </span>
                        {m.status === "CLOSED"
                          ? <Lock size={12} className="text-ink-muted" />
                          : <ChevronRight size={14} className="text-ink-muted" />
                        }
                      </div>
                    </Link>
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
