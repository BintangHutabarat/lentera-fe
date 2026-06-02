import { apiFetch } from "@/lib/api";
import type { SubjectColor } from "./subjects";

export type AssignmentStatus = "segera" | "belum" | "selesai";
export type AssignmentType = "ONLINE" | "UPLOAD_FILE" | "ESSAY";

export interface AssignmentListItem {
  id: string;
  title: string;
  subject: {
    id: string;
    name: string;
    color: SubjectColor;
  };
  teacher: {
    name: string;
  };
  type: AssignmentType;
  totalItems: string;
  maxScore: number;
  dueAt: string;
  status: AssignmentStatus;
  score: number | null;
}

export interface Submission {
  kind: "FILE" | "ESSAY" | "ONLINE_ANSWERS";
  fileName: string | null;
  fileSizeKB: number | null;
  fileUrl: string | null;
  essayText: string | null;
  note: string | null;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  feedbackFrom: string | null;
  rubricBreakdown: null;
}

export interface AssignmentDetail {
  id: string;
  title: string;
  subject: { id: string; name: string; color: SubjectColor };
  teacher: { name: string };
  type: AssignmentType;
  description: string;
  instructions: string[];
  minWords: number | null;
  totalItems?: string | null;
  attachment: { name: string; sizeKB: number; url: string } | null;
  rubric: { label: string; max: number }[];
  maxScore: number;
  dueAt: string;
  submission: Submission | null;
}

export interface GetAssignmentsParams {
  status?: AssignmentStatus | "all";
  subjectId?: string;
}

export function getAssignments(params?: GetAssignmentsParams): Promise<AssignmentListItem[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.subjectId) qs.set("subjectId", params.subjectId);
  const query = qs.toString();
  return apiFetch<AssignmentListItem[]>(`/assignments${query ? `?${query}` : ""}`);
}

export function getAssignment(id: string): Promise<AssignmentDetail> {
  return apiFetch<AssignmentDetail>(`/assignments/${id}`);
}

export interface SubmitFilePayload {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  note?: string;
}

export interface SubmitEssayPayload {
  essayText: string;
  note?: string;
}

export interface SubmitOnlinePayload {
  answers: Record<string, string>;
  note?: string;
}

export function submitAssignment(
  id: string,
  payload: SubmitFilePayload | SubmitEssayPayload | SubmitOnlinePayload,
): Promise<{ submittedAt: string }> {
  return apiFetch<{ submittedAt: string }>(`/assignments/${id}/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
