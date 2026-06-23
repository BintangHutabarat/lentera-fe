import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-surface-page">
      <header className="border-b border-border bg-surface-card/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" aria-label="Beranda Yayasan Darul Itqon Al Hakim">
            <BrandLogo size={36} />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
