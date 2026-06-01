import { apiFetch } from "@/lib/api";

export interface LeaderEntry {
  rank: number;
  name: string;
  initials: string;
  xp: number;
  avatarColor: string;
  isMe: boolean;
}

export function getClassLeaderboard(limit = 10): Promise<LeaderEntry[]> {
  return apiFetch<LeaderEntry[]>(`/leaderboard/class?limit=${limit}`);
}
