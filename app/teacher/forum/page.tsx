import { PageTopbar } from "@/components/layout/PageTopbar";
import { MessageCircle } from "lucide-react";

export default function TeacherForumPage() {
  return (
    <>
      <PageTopbar title="Forum" subtitle="Diskusi dengan siswa" />
      <div className="px-3.5 pt-3.5">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-mint-light flex items-center justify-center mb-4">
            <MessageCircle size={28} className="text-mint-dark" />
          </div>
          <h3 className="text-[15px] font-extrabold text-ink mb-2">Forum Diskusi</h3>
          <p className="text-[12px] text-ink-muted max-w-[240px] leading-relaxed">
            Fitur forum diskusi untuk guru sedang dalam pengembangan. Segera hadir!
          </p>
        </div>
      </div>
    </>
  );
}
