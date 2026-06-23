import Image from "next/image";
import { cn } from "@/lib/utils";

export const SCHOOL_NAME = "Yayasan Darul Itqon Al Hakim";

interface BrandLogoProps {
  /** Logo box size in px (square). */
  size?: number;
  /** Show the institution name beside the logo. */
  showName?: boolean;
  /** Two-line lockup (eyebrow "Yayasan" + bold name) vs. single line. */
  stacked?: boolean;
  className?: string;
  nameClassName?: string;
}

/**
 * Brand lockup for Yayasan Darul Itqon Al Hakim.
 * Uses the real institution logo (public/logo.png) so every entry point
 * reads as the school's own app — not a generic template.
 */
export function BrandLogo({
  size = 40,
  showName = true,
  stacked = true,
  className,
  nameClassName,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt={SCHOOL_NAME}
        width={size}
        height={size}
        priority
        className="object-contain flex-shrink-0"
        style={{ width: size, height: size }}
      />
      {showName &&
        (stacked ? (
          <div className="leading-tight">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              Yayasan
            </div>
            <div className={cn("text-[14px] font-extrabold text-ink tracking-tight", nameClassName)}>
              Darul Itqon Al Hakim
            </div>
          </div>
        ) : (
          <span
            className={cn(
              "text-[15px] font-extrabold text-ink tracking-tight leading-tight",
              nameClassName,
            )}
          >
            {SCHOOL_NAME}
          </span>
        ))}
    </div>
  );
}
