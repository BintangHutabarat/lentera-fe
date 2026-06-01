import { PageTopbar } from "@/components/layout/PageTopbar";
import { BookOpen } from "lucide-react";

export default function AdminKelasPage() {
  return (
    <>
      <PageTopbar title="Data Kelas" subtitle="Kelola kelas dan jurusan" />
      <div className="px-3.5 pt-3.5">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-light flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-yellow-dark" />
          </div>
          <h3 className="text-[15px] font-extrabold text-ink mb-2">Manajemen Kelas</h3>
          <p className="text-[12px] text-ink-muted max-w-[240px] leading-relaxed">
            Fitur manajemen kelas sedang dalam pengembangan. Segera hadir!
          </p>
        </div>
      </div>
    </>
  );
}
