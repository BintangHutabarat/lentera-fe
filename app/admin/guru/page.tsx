import { PageTopbar } from "@/components/layout/PageTopbar";
import { GraduationCap } from "lucide-react";

export default function AdminGuruPage() {
  return (
    <>
      <PageTopbar title="Data Guru" subtitle="Kelola akun dan data guru" />
      <div className="px-3.5 pt-3.5">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-light flex items-center justify-center mb-4">
            <GraduationCap size={28} className="text-brand-blue" />
          </div>
          <h3 className="text-[15px] font-extrabold text-ink mb-2">Manajemen Guru</h3>
          <p className="text-[12px] text-ink-muted max-w-[240px] leading-relaxed">
            Fitur manajemen data guru sedang dalam pengembangan. Segera hadir!
          </p>
        </div>
      </div>
    </>
  );
}
