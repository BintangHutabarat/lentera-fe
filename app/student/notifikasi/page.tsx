"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bell, CheckCheck, ClipboardList, Brain,
  MessageCircle, Megaphone, Clock, Loader2,
} from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/services/notifications";
import { timeAgo } from "@/lib/utils";
import type { Notification, NotificationType } from "@/lib/services/notifications";

const TYPE_META: Record<NotificationType, { Icon: React.ComponentType<{ size?: number; className?: string; color?: string }>; bg: string; color: string }> = {
  ASSIGNMENT_NEW:    { Icon: ClipboardList, bg: "#EDF3FF", color: "#4361EE" },
  ASSIGNMENT_GRADED: { Icon: ClipboardList, bg: "#E3FBF5", color: "#1a9c87" },
  ASSIGNMENT_DUE_SOON: { Icon: Clock,       bg: "#FEF9E7", color: "#c09000" },
  QUIZ_NEW:          { Icon: Brain,         bg: "#EDF3FF", color: "#4361EE" },
  FORUM_REPLY:       { Icon: MessageCircle, bg: "#E3FBF5", color: "#2B9FD8" },
  ANNOUNCEMENT:      { Icon: Megaphone,     bg: "#FEF9E7", color: "#c09000" },
};

export default function NotifikasiPage() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    getNotifications({ limit: 50 })
      .then((data) => setItems(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRead = async (notif: Notification) => {
    if (notif.readAt) return;
    setItems((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    await markNotificationRead(notif.id).catch(() => {});
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    } catch {
      /* silent */
    }
    setMarkingAll(false);
  };

  const unreadCount = items.filter((n) => !n.readAt).length;

  return (
    <>
      {/* Topbar */}
      <header className="bg-surface-card border-b border-border px-[18px] py-[13px] flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-[9px] flex items-center justify-center text-ink-muted hover:bg-surface-soft transition-colors cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-extrabold text-ink">Notifikasi</h3>
          {unreadCount > 0 && (
            <p className="text-[11px] text-ink-muted mt-0.5">{unreadCount} belum dibaca</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-[11px] font-bold text-brand-blue hover:opacity-80 transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            {markingAll ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCheck size={13} />
            )}
            Tandai semua
          </button>
        )}
      </header>

      <div className="px-3.5 pt-3.5">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-ink-muted">
            Memuat...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center mb-4">
              <Bell size={28} className="text-ink-muted" />
            </div>
            <h3 className="text-[15px] font-extrabold text-ink mb-2">Belum ada notifikasi</h3>
            <p className="text-[12px] text-ink-muted max-w-[240px] leading-relaxed">
              Notifikasi tentang tugas, quiz, dan forum akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="card mb-3.5">
            {items.map((notif, i) => {
              const meta = TYPE_META[notif.type] ?? TYPE_META.ANNOUNCEMENT;
              const { Icon } = meta;
              const isUnread = !notif.readAt;
              return (
                <button
                  key={notif.id}
                  onClick={() => handleRead(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-surface-soft transition-colors cursor-pointer ${
                    i < items.length - 1 ? "border-b border-surface-soft" : ""
                  } ${isUnread ? "bg-blue-light/30" : ""}`}
                >
                  <div
                    className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: meta.bg }}
                  >
                    <Icon size={17} color={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[13px] font-semibold leading-snug ${isUnread ? "text-ink font-bold" : "text-ink"}`}>
                        {notif.title}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed line-clamp-2">
                      {notif.body}
                    </p>
                    <div className="text-[10px] text-ink-muted mt-1">{timeAgo(notif.createdAt)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
