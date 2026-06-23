import { apiFetch } from "@/lib/api";

export type UploadPurpose = "assignment_submission" | "avatar" | "chapter_content" | "materi";

export interface PresignResponse {
  uploadUrl: string;
  fileKey: string;
  /** Public URL of the stored file (use this as the saved content URL). */
  fileUrl?: string;
  expiresInSeconds: number;
}

export async function presignUpload(
  purpose: UploadPurpose,
  filename: string,
  sizeBytes: number,
  mimeType: string,
): Promise<PresignResponse> {
  return apiFetch<PresignResponse>("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ purpose, filename, sizeBytes, mimeType }),
  });
}

export async function uploadFile(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!res.ok) throw new Error("Upload gagal");
}
