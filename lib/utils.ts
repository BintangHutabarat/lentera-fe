import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Color maps for subject colors → Tailwind / inline styles
export const subjectColorMap = {
  blue: {
    bg: "bg-blue-light",
    text: "text-blue-dark",
    bar: "#2B9FD8",
    chip: "bg-blue-light text-blue-dark",
  },
  teal: {
    bg: "bg-teal-light",
    text: "text-teal-dark",
    bar: "#3DD6B5",
    chip: "bg-teal-light text-teal-dark",
  },
  yellow: {
    bg: "bg-yellow-light",
    text: "text-yellow-dark",
    bar: "#F5C518",
    chip: "bg-yellow-light text-yellow-dark",
  },
  mint: {
    bg: "bg-mint-light",
    text: "text-mint-dark",
    bar: "#5FE0A0",
    chip: "bg-mint-light text-mint-dark",
  },
  red: {
    bg: "bg-red-light",
    text: "text-red-dark",
    bar: "#E05C5C",
    chip: "bg-red-light text-red-dark",
  },
  purple: {
    bg: "bg-[#EDF3FF]",
    text: "text-[#3d5af1]",
    bar: "#4361EE",
    chip: "bg-[#EDF3FF] text-[#3d5af1]",
  },
} as const;

export const dueUrgencyStyles = {
  today:    { bg: "#FEF0EF", color: "#b83232" },
  tomorrow: { bg: "#FEF9E7", color: "#7a5c00" },
  soon:     { bg: "#E6F6FD", color: "#1565a0" },
  done:     { bg: "#E3FBF5", color: "#1a8a75" },
} as const;

export function getDueUrgency(dueAt: string, status: string): "today" | "tomorrow" | "soon" | "done" {
  if (status === "selesai") return "done";
  const hours = (new Date(dueAt).getTime() - Date.now()) / 3_600_000;
  if (hours <= 24) return "today";
  if (hours <= 48) return "tomorrow";
  return "soon";
}

export function getDueLabel(dueAt: string, status: string): string {
  if (status === "selesai") return "Selesai";
  const diffMs = new Date(dueAt).getTime() - Date.now();
  const hours = diffMs / 3_600_000;
  if (hours < 0) return "Terlambat";
  if (hours <= 24) return "Hari ini";
  if (hours <= 48) return "Besok";
  const days = Math.ceil(diffMs / 86_400_000);
  if (days <= 7) return `${days} hari lagi`;
  return new Date(dueAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(isoDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
