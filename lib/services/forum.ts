import { apiFetch } from "@/lib/api";
import type { SubjectColor } from "./subjects";

export interface ForumAuthor {
  id: string;
  name: string;
  initials: string;
  role: "STUDENT" | "TEACHER";
  avatarColor: string;
}

export interface ForumPost {
  id: string;
  author: ForumAuthor;
  subject: { id: string; name: string; color: SubjectColor } | null;
  content: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  isPinned: boolean;
}

export interface ForumReply {
  id: string;
  author: ForumAuthor;
  content: string;
  createdAt: string;
}

export interface ForumPostDetail {
  post: ForumPost;
  replies: ForumReply[];
}

export interface PaginatedPosts {
  items: ForumPost[];
  nextCursor: string | null;
}

export interface GetPostsParams {
  cursor?: string;
  limit?: number;
  subject?: string;
}

export function getForumPosts(params?: GetPostsParams): Promise<PaginatedPosts> {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.subject) qs.set("subject", params.subject);
  const query = qs.toString();
  return apiFetch<PaginatedPosts>(`/forum/posts${query ? `?${query}` : ""}`);
}

export function createPost(content: string, subjectId?: string): Promise<ForumPost> {
  return apiFetch<ForumPost>("/forum/posts", {
    method: "POST",
    body: JSON.stringify({ content, ...(subjectId ? { subjectId } : {}) }),
  });
}

export function getForumPost(id: string): Promise<ForumPostDetail> {
  return apiFetch<ForumPostDetail>(`/forum/posts/${id}`);
}

export function replyToPost(id: string, content: string): Promise<ForumReply> {
  return apiFetch<ForumReply>(`/forum/posts/${id}/reply`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function likePost(id: string): Promise<void> {
  return apiFetch<void>(`/forum/posts/${id}/like`, { method: "POST" });
}

export function unlikePost(id: string): Promise<void> {
  return apiFetch<void>(`/forum/posts/${id}/like`, { method: "DELETE" });
}

export function savePost(id: string): Promise<void> {
  return apiFetch<void>(`/forum/posts/${id}/save`, { method: "POST" });
}

export function unsavePost(id: string): Promise<void> {
  return apiFetch<void>(`/forum/posts/${id}/save`, { method: "DELETE" });
}

export function getSavedPosts(params?: { cursor?: string; limit?: number }): Promise<PaginatedPosts> {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiFetch<PaginatedPosts>(`/forum/me/saved${query ? `?${query}` : ""}`);
}
