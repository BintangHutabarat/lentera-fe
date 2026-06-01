import { apiFetch } from "@/lib/api";
import type { SubjectColor } from "./subjects";

export interface ScheduleLesson {
  id: string;
  subject: { id: string; name: string; color: SubjectColor };
  room: string;
  timeStart: string;
  timeEnd: string;
}

export type WeekSchedule = {
  monday: ScheduleLesson[];
  tuesday: ScheduleLesson[];
  wednesday: ScheduleLesson[];
  thursday: ScheduleLesson[];
  friday: ScheduleLesson[];
  saturday: ScheduleLesson[];
};

export function getTodaySchedule(): Promise<ScheduleLesson[]> {
  return apiFetch<ScheduleLesson[]>("/schedule/today");
}

export function getWeekSchedule(): Promise<WeekSchedule> {
  return apiFetch<WeekSchedule>("/schedule/week");
}
