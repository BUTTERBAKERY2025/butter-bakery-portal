// Small client for the staff portal API (same origin, session cookie).
export type Access = "none" | "view" | "download";
export type Tier = "green" | "yellow" | "red";

export interface Section {
  id: string;
  tier: Tier;
  en: string;
  ar: string;
  descEn: string;
  descAr: string;
  access: Access;
}
export interface StaffUser {
  id: number;
  username: string;
  displayName: string;
  isAdmin: boolean;
  active: boolean;
  expiresAt: string | null;
  note: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  permissions: Record<string, Access>;
}
export interface BrandFile {
  id: number;
  path: string;
  section: string;
  mime: string;
  size: number;
  updatedAt: string;
  canDownload: boolean;
}
export interface LogRow {
  id: number;
  username: string | null;
  action: string;
  path: string | null;
  detail: string | null;
  ip: string | null;
  at: string;
}
export interface AdminSection extends Omit<Section, "access"> {
  files: number;
  bytes: number;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message || code);
  }
}

const BASE = "/api/staff";

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    method: init.method ?? "GET",
    credentials: "same-origin",
    headers: init.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "error", data.message);
  return data as T;
}

export const fileUrl = (id: number, mode: "view" | "download", thumb = false) =>
  `${BASE}/files/${id}/${mode}${thumb ? "?thumb=1" : ""}`;

export const fmtSize = (n: number) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`;

// Latin numerals in both languages (brand rule).
export const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";
