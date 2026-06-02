"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Plus, Trash2, Loader2 } from "lucide-react";
import { PageTopbar } from "@/components/layout/PageTopbar";
import {
  getAdminSchedule,
  getAdminClasses,
  getAdminClassSubjects,
  createScheduleSlot,
  deleteScheduleSlot,
} from "@/lib/services/admin";
import { subjectColorMap } from "@/lib/utils";
import { isApiError } from "@/lib/api";
import type { ScheduleSlot, AdminClass, AdminClassSubject } from "@/lib/services/admin";

const DAYS = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function AdminJadwalContent() {
  const params = useSearchParams();
  const initialClass = params.get("classId") ?? "";

  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [classSubjects, setClassSubjects] = useState<AdminClassSubject[]>([]);
  const [classFilter, setClassFilter] = useState(initialClass);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New slot form
  const [showForm, setShowForm] = useState(false);
  const [formClassId, setFormClassId] = useState("");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formDay, setFormDay] = useState("1");
  const [formStart, setFormStart] = useState("07:00");
  const [formEnd, setFormEnd] = useState("08:30");
  const [formRoom, setFormRoom] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadSlots = (classId?: string) => {
    setLoading(true);
    getAdminSchedule(classId || undefined)
      .then(setSlots)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([getAdminClasses(), getAdminSchedule(initialClass || undefined)])
      .then(([cls, s]) => { setClasses(cls); setSlots(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSlots(classFilter || undefined);
  }, [classFilter]);

  useEffect(() => {
    if (!formClassId) { setClassSubjects([]); return; }
    getAdminClassSubjects({ classId: formClassId }).then(setClassSubjects).catch(() => {});
  }, [formClassId]);

  const handleAddSlot = async () => {
    if (!formClassId || !formSubjectId || !formStart || !formEnd) {
      setError("Kelas, mapel, dan waktu wajib diisi.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createScheduleSlot({
        classId: formClassId,
        subjectId: formSubjectId,
        dayOfWeek: Number(formDay),
        timeStart: formStart,
        timeEnd: formEnd,
        room: formRoom.trim() || undefined,
      });
      loadSlots(classFilter || undefined);
      setShowForm(false);
      setFormClassId(""); setFormSubjectId(""); setFormDay("1");
      setFormStart("07:00"); setFormEnd("08:30"); setFormRoom("");
    } catch (e) {
      setError(isApiError(e) ? e.message : "Gagal menambah slot jadwal.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm("Hapus slot jadwal ini?")) return;
    try {
      await deleteScheduleSlot(slotId);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch {
      setError("Gagal menghapus jadwal.");
    }
  };

  const grouped = slots.reduce<Record<number, ScheduleSlot[]>>((acc, s) => {
    if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = [];
    acc[s.dayOfWeek].push(s);
    return acc;
  }, {});

  // Sort slots by time
  Object.values(grouped).forEach((day) => day.sort((a, b) => a.timeStart.localeCompare(b.timeStart)));

  return (
    <>
      <PageTopbar
        title="Jadwal Pelajaran"
        subtitle="Kelola slot jadwal per kelas"
        right={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="w-9 h-9 rounded-[10px] bg-brand-blue flex items-center justify-center cursor-pointer"
          >
            <Plus size={18} className="text-white" />
          </button>
        }
      />

      <div className="px-3.5 pt-3.5 pb-24 flex flex-col gap-3">
        {error && (
          <div className="text-[12px] text-red-dark bg-red-light rounded-[10px] px-3 py-2">{error}</div>
        )}

        {/* Class filter */}
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="w-full h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
        >
          <option value="">Semua Kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Add form */}
        {showForm && (
          <div className="card p-4 flex flex-col gap-2.5">
            <h4 className="text-[13px] font-extrabold text-ink">Tambah Slot Jadwal</h4>
            <select
              value={formClassId}
              onChange={(e) => { setFormClassId(e.target.value); setFormSubjectId(""); }}
              className="w-full h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
            >
              <option value="">Pilih kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={formSubjectId}
              onChange={(e) => setFormSubjectId(e.target.value)}
              disabled={!formClassId}
              className="w-full h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer disabled:opacity-50"
            >
              <option value="">Pilih mapel</option>
              {classSubjects.map((cs) => (
                <option key={cs.id} value={cs.subject.id}>{cs.subject.name}</option>
              ))}
            </select>
            <select
              value={formDay}
              onChange={(e) => setFormDay(e.target.value)}
              className="w-full h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue cursor-pointer"
            >
              {DAYS.slice(1).map((d, i) => (
                <option key={i + 1} value={i + 1}>{d}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-ink-muted mb-1">Mulai</label>
                <input
                  type="time"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                  className="w-full h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-ink-muted mb-1">Selesai</label>
                <input
                  type="time"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                  className="w-full h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
                />
              </div>
            </div>
            <input
              value={formRoom}
              onChange={(e) => setFormRoom(e.target.value)}
              placeholder="Ruangan (opsional, misal: R101)"
              className="w-full h-10 rounded-[10px] border border-border bg-surface-card px-3 text-[13px] text-ink outline-none focus:border-brand-blue"
            />
            <button
              onClick={handleAddSlot}
              disabled={submitting}
              className="h-10 rounded-[10px] bg-brand-blue text-white text-[13px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Menyimpan..." : "Simpan Slot"}
            </button>
          </div>
        )}

        {/* Schedule list */}
        {loading ? (
          <div className="text-center text-[13px] text-ink-muted py-10">Memuat...</div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-teal-light flex items-center justify-center mb-3">
              <CalendarDays size={24} className="text-brand-teal" />
            </div>
            <p className="text-[13px] font-bold text-ink">Belum ada jadwal</p>
            <p className="text-[11px] text-ink-muted mt-1">Tambah slot jadwal dengan tombol + di atas.</p>
          </div>
        ) : (
          [1, 2, 3, 4, 5, 6]
            .filter((day) => grouped[day]?.length)
            .map((day) => (
              <div key={day}>
                <h3 className="text-[13px] font-extrabold text-ink-muted mb-2">{DAYS[day]}</h3>
                <div className="card">
                  {grouped[day].map((slot, i) => {
                    const colorKey = slot.subject.color.toLowerCase() as keyof typeof subjectColorMap;
                    const colors = subjectColorMap[colorKey] ?? subjectColorMap.blue;
                    return (
                      <div
                        key={slot.id}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          i < grouped[day].length - 1 ? "border-b border-surface-soft" : ""
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                          <CalendarDays size={15} className={colors.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-extrabold text-ink">{slot.subject.name}</div>
                          <div className="text-[11px] text-ink-muted mt-0.5">
                            {slot.timeStart}–{slot.timeEnd}
                            {slot.room ? ` · ${slot.room}` : ""}
                            {!classFilter ? ` · ${slot.class.name}` : ""}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-red-dark hover:bg-red-light transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        )}
      </div>
    </>
  );
}

export default function AdminJadwalPage() {
  return (
    <Suspense>
      <AdminJadwalContent />
    </Suspense>
  );
}
