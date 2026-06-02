"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Lightbulb, ClipboardList, Brain, Users, BookOpen, LogOut } from "lucide-react";
import { logout } from "@/lib/services/auth";
import { getTeacherMe, getTeacherClassSubjects } from "@/lib/services/teacher";
import { Avatar } from "@/components/ui/Avatar";
import { subjectColorMap } from "@/lib/utils";
import { subjectIcons } from "@/lib/icons";
import type { TeacherMe, TeacherClassSubject } from "@/lib/services/teacher";

const QUICK_ACTIONS = [
  { label: "Kelas", Icon: BookOpen,      href: "/teacher/kelas" },
  { label: "Tugas", Icon: ClipboardList, href: "/teacher/tugas" },
  { label: "Quiz",  Icon: Brain,         href: "/teacher/quiz" },
  { label: "Forum", Icon: Users,         href: "/teacher/forum" },
];

export default function TeacherBerandaPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherMe | null>(null);
  const [classSubjects, setClassSubjects] = useState<TeacherClassSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTeacherMe(), getTeacherClassSubjects()])
      .then(([me, cs]) => {
        setProfile(me);
        setClassSubjects(cs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login/staff");
  };

  const initials = profile?.name
    ? profile.name.split(" ").slice(0, 2).map((n) => n[0]).join("")
    : "GR";

  const totalAssignments = classSubjects.reduce((acc, cs) => acc + cs.assignmentCount, 0);
  const totalQuizzes = classSubjects.reduce((acc, cs) => acc + cs.quizCount, 0);

  return (
    <>
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
          <div className="flex items-center gap-2">
            <button className="relative w-[34px] h-[34px] bg-white/18 rounded-[9px] flex items-center justify-center cursor-pointer">
              <Bell size={16} className="text-white" />
            </button>
            <button
              onClick={handleLogout}
              className="w-[34px] h-[34px] bg-white/18 rounded-[9px] flex items-center justify-center cursor-pointer"
              aria-label="Keluar"
            >
              <LogOut size={15} className="text-white" />
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-[19px] font-extrabold text-white mb-1">
              {loading ? "Memuat..." : `Halo, ${profile?.name?.split(" ")[0] ?? "Guru"}! 👋`}
            </h2>
            <p className="text-[12px] text-white/80">
              {profile?.title ? `${profile.title} • ` : ""}{profile?.school?.name ?? ""}
            </p>
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
        <div className="grid grid-cols-3 gap-2.5 mb-3.5">
          <div className="card p-3 text-center">
            <div className="text-[18px] font-extrabold text-brand-blue">{classSubjects.length}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Kelas-Mapel</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-[18px] font-extrabold text-teal-dark">{totalAssignments}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Tugas</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-[18px] font-extrabold text-yellow-dark">{totalQuizzes}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Quiz</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5 mb-3.5">
          {QUICK_ACTIONS.map(({ label, Icon, href }) => (
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
          <h3 className="text-[14px] font-extrabold text-ink">Kelas yang Diampu</h3>
          <Link href="/teacher/kelas" className="text-[12px] font-semibold text-brand-blue">Lihat semua →</Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-[13px] text-ink-muted">Memuat...</div>
        ) : classSubjects.length === 0 ? (
          <div className="card p-4 text-center text-[12px] text-ink-muted">
            Belum ada kelas-mapel yang ditugaskan.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-3.5">
            {classSubjects.slice(0, 4).map((cs) => {
              const c = subjectColorMap[cs.subject.color];
              const SubjIcon = subjectIcons[cs.subject.color];
              return (
                <Link
                  key={cs.id}
                  href={`/teacher/kelas/${cs.id}`}
                  className="card p-3.5 flex gap-3 items-center cursor-pointer hover:border-brand-teal transition-all active:scale-[0.99]"
                >
                  <div
                    className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c.bar}22` }}
                  >
                    <SubjIcon size={22} strokeWidth={1.5} style={{ color: c.bar }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold text-ink truncate">
                      {cs.subject.name} • {cs.class.name}
                    </div>
                    <div className="text-[11px] text-ink-muted mt-0.5">
                      {cs.assignmentCount} tugas • {cs.quizCount} quiz
                    </div>
                  </div>
                  <div className="text-ink-muted text-sm flex-shrink-0">›</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
