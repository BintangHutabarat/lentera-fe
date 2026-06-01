import { apiFetch } from "@/lib/api";

export type UploadPurpose = "assignment_submission" | "avatar";

export interface PresignResponse {
  uploadUrl: string;
  fileKey: string;
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
