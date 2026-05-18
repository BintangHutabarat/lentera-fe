// ── Student ──
export interface Student {
  id: string;
  name: string;
  avatar?: string;
  class: string;
  school: string;
  level: number;
  xp: number;
  xpMax: number;
  attendance: number;
  avgScore: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  label: string;
  icon: string;
  earned: boolean;
}

// ── Subject / Course ──
export interface Subject {
  id: string;
  name: string;
  teacher: string;
  icon: string;
  color: "blue" | "teal" | "yellow" | "mint" | "red" | "purple";
  chaptersTotal: number;
  chaptersDone: number;
  progress: number; // 0-100
  currentChapter: string;
}

// ── Assignment ──
export type AssignmentStatus = "segera" | "belum" | "selesai";

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  subjectColor: Subject["color"];
  teacher: string;
  icon: string;
  type: string;
  dueLabel: string;
  dueUrgency: "today" | "tomorrow" | "soon" | "done";
  status: AssignmentStatus;
  score?: number;
  maxScore: number;
  totalItems?: string;
}

// ── Quiz ──
export interface Quiz {
  id: string;
  title: string;
  subject: string;
  subjectColor: Subject["color"];
  icon: string;
  totalQuestions: number;
  durationMinutes: number;
  chapter: string;
  completed: boolean;
  score?: number;
  stars?: number; // 1-5
}

// ── Schedule ──
export interface ScheduleItem {
  id: string;
  subject: string;
  room: string;
  timeStart: string;
  timeEnd: string;
  color: string;
}

// ── Forum ──
export interface ForumPost {
  id: string;
  author: string;
  authorInitials: string;
  authorColor: string;
  role: "student" | "teacher";
  subjectTag?: string;
  subjectColor?: Subject["color"];
  content: string;
  timeAgo: string;
  likes: number;
  replies: number;
}

// ── Leaderboard ──
export interface LeaderEntry {
  rank: number;
  name: string;
  initials: string;
  color: string;
  xp: number;
  isMe?: boolean;
}
