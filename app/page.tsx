import Link from "next/link";
import {
  Lightbulb, BookOpen, Brain, ClipboardList, MessageCircle,
  Trophy, ArrowRight, Mail,
} from "lucide-react";

// Lucide v1.14 doesn't ship brand-trademark icons (Instagram/YouTube/X) —
// inline minimal SVGs so the footer doesn't need an extra dep.
function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}
function IconYoutube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
      <path d="M10.5 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 3H21l-6.52 7.45L22 21h-6.78l-4.77-6.23L4.9 21H2.14l6.97-7.97L2 3h6.94l4.32 5.7L18.244 3Zm-2.38 16.2h1.5L7.2 4.7H5.6l10.264 14.5Z" />
    </svg>
  );
}

const FEATURE_BADGES = [
  { Icon: BookOpen,      label: "Materi",  bg: "#E6F6FD", color: "#1a6a9a" },
  { Icon: ClipboardList, label: "Tugas",   bg: "#FEF9E7", color: "#7a5c00" },
  { Icon: Brain,         label: "Quiz",    bg: "#E3FBF5", color: "#1a9c87" },
  { Icon: MessageCircle, label: "Forum",   bg: "#EDF3FF", color: "#3d5af1" },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-surface-page">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-20 bg-surface-card/85 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ background: "var(--brand-grad)" }}
            >
              <Lightbulb size={18} className="text-white" fill="rgba(255,255,255,0.9)" />
            </div>
            <span className="text-[17px] font-extrabold text-ink tracking-tight">Lentera</span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/auth/login/siswa"
              className="px-3.5 py-2 text-[13px] font-bold text-ink-secondary hover:text-brand-blue transition-colors"
            >
              Masuk Siswa
            </Link>
            <Link
              href="/auth/login/staff"
              className="px-3.5 py-2 text-[13px] font-extrabold text-white rounded-[10px] bg-brand-blue hover:opacity-90 transition-opacity"
            >
              Masuk Guru/Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex-1 overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl"
             style={{ background: "var(--brand-grad)" }} />
        <div className="pointer-events-none absolute -bottom-40 -left-32 w-[460px] h-[460px] rounded-full opacity-25 blur-3xl"
             style={{ background: "linear-gradient(135deg,#7EEFC7,#3DD6B5)" }} />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-20 pb-12 sm:pb-24 grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Text */}
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-light text-teal-dark text-[11px] font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
              LMS untuk SMA Indonesia
            </span>

            <h1 className="mt-4 text-[30px] sm:text-[38px] md:text-[44px] leading-[1.1] font-extrabold text-ink tracking-tight">
              Belajar pintar,{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--brand-grad)" }}>
                lebih menyenangkan
              </span>
            </h1>

            <p className="mt-4 text-[14px] sm:text-[15px] text-ink-secondary leading-relaxed max-w-xl mx-auto md:mx-0">
              Tugas, quiz, materi, dan forum diskusi dalam satu aplikasi mobile-first
              yang ringan, ramah kuota, dan didesain khusus untuk siswa SMA.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-col sm:flex-row gap-2.5 justify-center md:justify-start">
              <Link
                href="/auth/login/siswa"
                className="group inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[12px] bg-brand-blue text-white text-[14px] font-extrabold active:scale-[0.98] transition-all hover:opacity-90"
              >
                Masuk sebagai Siswa
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth/login/staff"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[12px] bg-surface-card border border-border text-ink text-[14px] font-extrabold active:scale-[0.98] transition-all hover:border-brand-blue hover:text-brand-blue"
              >
                Masuk sebagai Guru / Admin
              </Link>
            </div>

            <p className="mt-4 text-[11px] text-ink-muted">
              Akun dibuatkan oleh sekolah. Belum punya? Hubungi guru atau admin sekolahmu.
            </p>
          </div>

          {/* Visual */}
          <div className="relative hidden md:block">
            <div
              className="absolute inset-0 rounded-[28px] opacity-[0.18] blur-2xl"
              style={{ background: "var(--brand-grad)" }}
            />
            <div className="relative card p-6 shadow-[0_30px_60px_-20px_rgba(43,159,216,0.35)]">
              {/* Hero card: faux dashboard preview */}
              <div
                className="rounded-[14px] p-4 text-white"
                style={{ background: "var(--brand-grad)" }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-[12px] font-extrabold">Halo, Rizky! ☀️</div>
                  <Trophy size={16} className="text-white/90" />
                </div>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-[28px] font-extrabold leading-none">Level 12</span>
                  <span className="text-[11px] text-white/85 mb-0.5">1.240 XP</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/25 overflow-hidden">
                  <div className="h-full rounded-full bg-white w-[68%]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                {FEATURE_BADGES.map(({ Icon, label, bg, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 p-3 rounded-[12px] border border-border"
                    style={{ background: bg }}
                  >
                    <Icon size={16} style={{ color }} />
                    <span className="text-[12px] font-extrabold" style={{ color }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3.5 flex items-center gap-2.5 p-3 rounded-[12px] bg-surface-soft">
                <div className="w-8 h-8 rounded-full bg-yellow-light flex items-center justify-center">
                  <span className="text-[14px]">🔥</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-extrabold text-ink">7 hari streak!</div>
                  <div className="text-[10px] text-ink-muted">Terus jaga semangatnya.</div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-yellow-light text-yellow-dark">
                  +50 XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-surface-card">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-[9px] flex items-center justify-center"
                  style={{ background: "var(--brand-grad)" }}
                >
                  <Lightbulb size={15} className="text-white" fill="rgba(255,255,255,0.9)" />
                </div>
                <span className="text-[15px] font-extrabold text-ink">Lentera</span>
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed max-w-xs">
                Platform pembelajaran interaktif berbahasa Indonesia untuk siswa SMA.
              </p>
            </div>

            <div>
              <h4 className="text-[12px] font-extrabold uppercase tracking-wide text-ink mb-2.5">
                Kontak
              </h4>
              <ul className="flex flex-col gap-1.5 text-[12px] text-ink-secondary">
                <li className="flex items-center gap-1.5">
                  <Mail size={12} className="text-brand-blue" />
                  halo@lentera.sch.id
                </li>
                <li>SMA Negeri 1 Jakarta</li>
                <li className="text-ink-muted">Senin – Jumat, 08.00 – 16.00</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[12px] font-extrabold uppercase tracking-wide text-ink mb-2.5">
                Ikuti Kami
              </h4>
              <div className="flex gap-2">
                {[
                  { Icon: IconInstagram, label: "Instagram" },
                  { Icon: IconX,         label: "X (Twitter)" },
                  { Icon: IconYoutube,   label: "YouTube" },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-9 h-9 rounded-[10px] bg-surface-soft hover:bg-blue-light text-ink-secondary hover:text-brand-blue flex items-center justify-center transition-colors"
                  >
                    <Icon width={16} height={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-surface-soft flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-ink-muted">
              © {new Date().getFullYear()} Lentera. Hak cipta dilindungi.
            </p>
            <div className="flex gap-4 text-[11px] text-ink-muted">
              <a href="#" className="hover:text-brand-blue transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-brand-blue transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
