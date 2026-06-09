"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, Search, Users } from "lucide-react";
import { PageTopbar } from "@/components/layout/PageTopbar";
import { getPrincipalUsers } from "@/lib/services/principal";
import { Avatar } from "@/components/ui/Avatar";
import type { PrincipalUser } from "@/lib/services/principal";

type RoleFilter = "ALL" | "STUDENT" | "TEACHER";

export default function PrincipalPenggunaPage() {
  const [users, setUsers] = useState<PrincipalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RoleFilter>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPrincipalUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    if (filter !== "ALL" && u.role !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.profile.name.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.profile.nis ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <PageTopbar title="Data Pengguna" subtitle={`${users.length} pengguna`} />

      <div className="px-3.5 pt-3.5 pb-24">
        {/* Search */}
        <div className="relative mb-2.5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau NIS..."
            className="w-full h-10 rounded-[10px] border border-border bg-surface-card pl-9 pr-3 text-[13px] text-ink outline-none focus:border-brand-blue transition-colors"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-3.5">
          {(["ALL", "STUDENT", "TEACHER"] as RoleFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`flex-1 h-9 rounded-[10px] text-[11px] font-extrabold transition-colors cursor-pointer ${
                filter === r ? "bg-brand-blue text-white" : "bg-surface-soft text-ink-muted"
              }`}
            >
              {r === "ALL" ? "Semua" : r === "STUDENT" ? "Siswa" : "Guru"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-[13px] text-ink-muted py-10">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center mb-3">
              <Users size={20} className="text-ink-muted" />
            </div>
            <p className="text-[13px] font-bold text-ink">Tidak ada pengguna</p>
          </div>
        ) : (
          <div className="card">
            {filtered.map((u, i) => {
              const initials = u.profile.name.split(" ").slice(0, 2).map((n) => n[0]).join("");
              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-2.5 px-4 py-3 ${i < filtered.length - 1 ? "border-b border-surface-soft" : ""}`}
                >
                  <Avatar initials={initials} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink truncate">{u.profile.name}</div>
                    <div className="text-[10px] text-ink-muted mt-0.5 truncate">
                      {u.role === "STUDENT"
                        ? `NIS: ${u.profile.nis ?? "—"} · ${u.profile.class ?? ""}`
                        : u.email ?? "—"}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    {u.role === "TEACHER" && <GraduationCap size={12} className="text-brand-teal" />}
                    {!u.isActive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-light text-red-dark">
                        Nonaktif
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
