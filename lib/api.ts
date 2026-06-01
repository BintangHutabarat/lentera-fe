const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
}

export function isApiError(e: unknown): e is ApiError {
  return typeof e === "object" && e !== null && "code" in e && "statusCode" in e;
}

// ── Token helpers (cookie, readable server & client) ──────────────────────────

export function getAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)lentera\.token=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function setAccessToken(token: string) {
  document.cookie = `lentera.token=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
}

export function clearAccessToken() {
  document.cookie = "lentera.token=; path=/; max-age=0";
}

// ── Internal refresh ──────────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data: { accessToken: string } = await res.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

interface FetchOptions {
  withAuth?: boolean;
  _isRetry?: boolean;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  { withAuth = true, _isRetry = false }: FetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (withAuth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && withAuth && !_isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, init, { withAuth, _isRetry: true });
    }
    clearAccessToken();
    if (typeof window !== "undefined") window.location.href = "/auth/login/siswa";
    throw { statusCode: 401, code: "UNAUTHORIZED", message: "Sesi kamu telah berakhir, silakan login kembali." } satisfies ApiError;
  }

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      statusCode: res.status,
      code: "UNKNOWN_ERROR",
      message: "Terjadi kesalahan, coba lagi.",
    }));
    throw err as ApiError;
  }

  return res.json() as Promise<T>;
}
