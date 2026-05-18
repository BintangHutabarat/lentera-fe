import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  bgColor?: string;
  textColor?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm:  "w-7 h-7 text-[11px]",
  md:  "w-8 h-8 text-xs",
  lg:  "w-[68px] h-[68px] text-2xl",
};

export function Avatar({ initials, bgColor, textColor, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-bold flex-shrink-0", sizeMap[size], className)}
      style={{
        backgroundColor: bgColor ?? "#E3FBF5",
        color: textColor ?? "#1a8a75",
      }}
    >
      {initials}
    </div>
  );
}
