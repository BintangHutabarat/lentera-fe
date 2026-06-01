"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Lightbulb, Bell, BookOpen, ClipboardList, Brain, MessageCircle,
  BookMarked, CheckCircle2, Star, Target, Trophy,
} from "lucide-react";
import { getStudentProfile, getStudentStats, getStudentBadges } from "@/lib/services/student";
import { getSubjects } from "@/lib/services/subjects";
import { getAssignments } from "@/lib/services/assignments";
import { getTodaySchedule } from "@/lib/services/schedule";
import { getClassLeaderboard } from "@/lib/services/leaderboard";
import { XPBar } from "@/components/ui/XPBar";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { subjectColorMap, dueUrgencyStyles, getDueUrgency, getDueLabel } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { Student } from "@/types";
import type { Subject } from "@/lib/services/subjects";
import type { AssignmentListItem } from "@/lib/services/assignments";
import type { ScheduleLesson } from "@/lib/services/schedule";
import type { LeaderEntry } from "@/lib/services/leaderboard";

const quickActions = [
  { label: "Materi",  Icon: BookOpen,      href: "/student/pelajaran" },
  { label: "Tugas",   Icon: ClipboardList, href: "/student/tugas" },
  { label: "Quiz",    Icon: Brain,         href: "/student/quiz" },
  { label: "Diskusi", Icon: MessageCircle, href: "/student/forum" },
];

const RANK_STYLE: Record<number, { bg: string; color: string }> = {
  1: { bg: "#F5C518", color: "#7a5c00" },
  2: { bg: "#C8D4DC", color: "#4a5568" },
  3: { bg: "#D4956A", color: "#7a3d0a" },
};

export default function BerandaPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleLesson[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getStudentProfile(),
      getStudentStats(),
      getStudentBadges(),
      getSubjects(),
      getAssignments(),
      getTodaySchedule(),
      getClassLeaderboard(),
    ]).then(([profile, stats, badges, subjs, assigns, sched, leaders]) => {
      setStudent({
        id: profile.id,
        name: profile.name,
        class: profile.class.name,
        school: profile.school.name,
        level: profile.level,
        xp: profile.xp,
        xpMax: profile.xpMax,
        attendance: stats.attendance,
        avgScore: stats.avgScore,
        badges,
      });
      setSubjects(subjs);
      setAssignments(assigns);
      setSchedule(sched);
      setLeaderboard(leaders);
    }).catch((err) => {
      setError(err?.message ?? "Gagal memuat data.");
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
        Memuat...
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center h-40 px-6 text-center text-[13px] text-ink-muted">
        {error ?? "Gagal memuat data."}
      </div>
    );
  }

  const urgentAssignments = assignments.filter((a) => a.status !== "selesai");
  const topSubjects = subjects.slice(0, 3);
  const initials = student.name.split(" ").slice(0, 2).map((n) => n[0]).join("");

  return (
    <>
      {/* ── Brand Header ── */}
      <div
        className="relative overflow-hidden px-[18px] pb-6 pt-[18px]"
        style={{ background: "linear-gradient(135deg,#2B9FD8 0%,#3DD6B5 60%,#7EEFC7 100%)" }}
      >
        <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 left-[5%] w-36 h-36 rounded-full bg-white/7" />

        <div className="relative flex items-center justify-between mb-[18px]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 rounded-[10px] flex items-center justify-center">
              <Lightbulb size={18} className="text-white" fill="rgba(255,255,255,0.9)" />
            </div>
            <span className="text-[18px] font-extrabold text-white tracking-tight">Lentera</span>
          </div>
          <button className="relative w-[34px] h-[34px] bg-white/18 rounded-[9px] flex items-center justify-center cursor-pointer">
            <Bell size={16} className="text-white" />
            <span className="absolute top-1.5 right-[7px] w-[7px] h-[7px] bg-brand-yellow rounded-full border-[1.5px] border-white/50" />
          </button>
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-[19px] font-extrabold text-white mb-1">Hai, {student.name.split(" ")[0]}! ☀️</h2>
            <p className="text-[12px] text-white/80">{urgentAssignments.length} tugas perlu dikumpulkan.</p>
          </div>
          <Avatar
            initials={initials}
            bgColor="rgba(255,255,255,0.22)"
            textColor="#ffffff"
            size="lg"
            className="w-12 h-12 border-2 border-white/35 text-[15px]"
          />
        </div>
      </div>

      <div className="px-3.5 pt-3.5">
        <XPBar student={student} />

        <div className="grid grid-cols-2 gap-3 mb-3.5">
          <StatCard
            icon={<BookMarked size={18} color="#2B9FD8" />}
            iconBg="#E6F6FD"
            value={subjects.length}
            valueColor="#2B9FD8"
            label="Mata Pelajaran"
            badge="↑ Semua aktif"
            badgeVariant="up"
          />
          <StatCard
            icon={<CheckCircle2 size={18} color="#3DD6B5" />}
            iconBg="#E3FBF5"
            value={`${student.avgScore > 0 ? Math.round((assignments.filter(a => a.status === "selesai").length / Math.max(assignments.length, 1)) * 100) : 0}%`}
            valueColor="#3DD6B5"
            label="Tugas Selesai"
            badge="↑ Diperbarui"
            badgeVariant="up"
          />
          <StatCard
            icon={<Star size={18} color="#7a5c00" />}
            iconBg="#FEF9E7"
            value={student.avgScore}
            valueColor="#7a5c00"
            label="Rata-rata Nilai"
            badge="↑ Naik"
            badgeVariant="up"
          />
          <StatCard
            icon={<Target size={18} color="#b83232" />}
            iconBg="#FEF0EF"
            value={`${student.attendance}%`}
            valueColor="#b83232"
            label="Kehadiran"
            badge="Kehadiran kamu"
            badgeVariant="neutral"
          />
        </div>

        <div className="grid grid-cols-4 gap-2.5 mb-3.5">
          {quickActions.map(({ label, Icon, href }) => (
            <Link
              key={href}
              href={href}
              className="bg-surface-card border border-border rounded-[9px] py-3.5 px-2 text-center hover:border-brand-teal hover:bg-teal-light transition-all active:scale-95 cursor-pointer"
            >
              <div className="flex justify-center mb-1.5">
                <Icon size={20} className="text-brand-blue" strokeWidth={2} />
              </div>
              <div className="text-[11px] font-bold text-ink">{label}</div>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[14px] font-extrabold text-ink">Mata Pelajaran Aktif</h3>
          <Link href="/student/pelajaran" className="text-[12px] font-semibold text-brand-blue">Lihat semua →</Link>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-3.5">
          {topSubjects.map((subj) => {
            const c = subjectColorMap[subj.color];
            const SubjIcon = subjectIcons[subj.color];
            return (
              <Link
                key={subj.id}
                href="/student/pelajaran"
                className="bg-surface-card border border-border rounded-card overflow-hidden hover:-translate-y-0.5 transition-transform active:scale-95 cursor-pointer"
              >
                <div
                  className="h-[72px] flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${c.bar}22, ${c.bar}44)` }}
                >
                  <SubjIcon size={28} strokeWidth={1.5} style={{ color: c.bar }} />
                </div>
                <div className="p-3">
                  <div className={`text-[9px] font-extrabold uppercase tracking-[0.6px] mb-1 ${c.text}`}>{subj.name}</div>
                  <div className="text-[11px] font-bold text-ink mb-1.5 leading-tight line-clamp-2">
                    {subj.currentChapter}
                  </div>
                  <ProgressBar value={subj.progress} height="sm" color={c.bar} />
                  <div className="text-[10px] text-ink-muted mt-1">{subj.progress}%</div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[14px] font-extrabold text-ink">Tugas Mendekati Deadline</h3>
          <Link href="/student/tugas" className="text-[12px] font-semibold text-brand-blue">Lihat semua →</Link>
        </div>
        <div className="card mb-3.5">
          {urgentAssignments.length === 0 ? (
            <div className="px-4 py-4 text-[12px] text-ink-muted text-center">
              Semua tugas sudah dikumpulkan!
            </div>
          ) : (
            urgentAssignments.map((a, i) => {
              const c = subjectColorMap[a.subject.color];
              const SubjIcon = subjectIcons[a.subject.color];
              const urgency = getDueUrgency(a.dueAt, a.status);
              const due = dueUrgencyStyles[urgency];
              const label = getDueLabel(a.dueAt, a.status);
              return (
                <Link
                  key={a.id}
                  href={`/student/tugas/${a.id}`}
                  className={`flex gap-2.5 items-center px-4 py-2.5 hover:bg-surface-soft transition-colors ${i < urgentAssignments.length - 1 ? "border-b border-surface-soft" : ""}`}
                >
                  <div
                    className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c.bar}22` }}
                  >
                    <SubjIcon size={18} strokeWidth={1.5} style={{ color: c.bar }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink truncate">{a.title}</div>
                    <div className="text-[10px] text-ink-muted mt-0.5">{a.subject.name} • {a.teacher.name}</div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                    style={{ background: due.bg, color: due.color }}
                  >
                    {label}
                  </span>
                </Link>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3.5">
          <div>
            <h3 className="text-[14px] font-extrabold text-ink mb-2.5">Jadwal Hari Ini</h3>
            <div className="card p-4">
              {schedule.length === 0 ? (
                <div className="text-[11px] text-ink-muted text-center py-2">Tidak ada jadwal hari ini</div>
              ) : (
                schedule.map((sc, i) => (
                  <div key={sc.id} className={`flex gap-2.5 items-center py-2 ${i < schedule.length - 1 ? "border-b border-surface-soft" : ""}`}>
                    <div className="min-w-[46px] text-[10px] font-bold text-brand-blue text-center leading-[1.4]">
                      {sc.timeStart}<br />{sc.timeEnd}
                    </div>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: subjectColorMap[sc.subject.color].bar }} />
                    <div>
                      <div className="text-[12px] font-bold text-ink">{sc.subject.name}</div>
                      <div className="text-[10px] text-ink-muted mt-0.5">{sc.room}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[14px] font-extrabold text-ink mb-2.5 flex items-center gap-1.5">
              <Trophy size={14} className="text-brand-yellow" />
              Peringkat
            </h3>
            <div className="card p-4">
              {leaderboard.map((entry) => {
                const rankStyle = RANK_STYLE[entry.rank];
                return (
                  <div key={entry.rank} className="flex items-center gap-2.5 py-[7px]">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0"
                      style={rankStyle
                        ? { background: rankStyle.bg, color: rankStyle.color }
                        : { color: "#6B8E9F" }
                      }
                    >
                      {entry.rank}
                    </div>
                    <div
                      className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0"
                      style={{ background: entry.avatarColor, color: "#1C3B4A" }}
                    >
                      {entry.initials}
                    </div>
                    <div className={`flex-1 text-[12px] font-semibold truncate ${entry.isMe ? "font-extrabold text-brand-blue" : "text-ink"}`}>
                      {entry.isMe ? "Kamu" : entry.name.split(" ")[0]}
                    </div>
                    <div className="text-[12px] font-extrabold text-brand-blue">{entry.xp.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
