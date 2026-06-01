import { apiFetch } from "@/lib/api";

export type NotificationType =
  | "ASSIGNMENT_NEW"
  | "ASSIGNMENT_GRADED"
  | "ASSIGNMENT_DUE_SOON"
  | "QUIZ_NEW"
  | "FORUM_REPLY"
  | "ANNOUNCEMENT";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  linkTo: string;
  readAt: string | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: Notification[];
  nextCursor: string | null;
  unreadCount: number;
}

export interface GetNotificationsParams {
  unreadOnly?: true;
  cursor?: string;
  limit?: number;
}

export function getNotifications(params?: GetNotificationsParams): Promise<PaginatedNotifications> {
  const qs = new URLSearchParams();
  if (params?.unreadOnly) qs.set("unreadOnly", "true");
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiFetch<PaginatedNotifications>(`/notifications${query ? `?${query}` : ""}`);
}

export function markNotificationRead(id: string): Promise<void> {
  return apiFetch<void>(`/notifications/${id}/read`, { method: "POST" });
}

export function markAllNotificationsRead(): Promise<void> {
  return apiFetch<void>("/notifications/read-all", { method: "POST" });
}
