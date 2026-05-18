import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  height?: "sm" | "md" | "lg";
  color?: string; // hex override
  className?: string;
}

const heightMap = { sm: "h-1", md: "h-1.5", lg: "h-2" };

export function ProgressBar({
  value, height = "md", color, className,
}: ProgressBarProps) {
  return (
    <div className={cn("w-full bg-surface-soft rounded-full overflow-hidden", heightMap[height], className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", !color && "progress-fill")}
        style={{ width: `${Math.min(100, value)}%`, ...(color ? { background: color } : {}) }}
      />
    </div>
  );
}
