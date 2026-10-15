import type { Model3D } from "./Design3D";

/** A design's 3D model as stored: asset fields are brand-file paths. */
export type StoredModel =
  | { type: "cup"; oz: string; colour: string; texture: string }
  | { type: "box"; L: number; W: number; H: number; color: string; logoColor: string; logo: string }
  | { type: "flat"; w: number; h: number; d?: number; front: string; back?: string; standing?: boolean }
  | { type: "card"; w: number; h: number; bg: string; logo: string; logoColor: string; backBg: string; symbol: string; symbolColor: string }
  | { type: "bag"; w: number; h: number; d: number; color: string; logoColor: string; logo: string; front?: string; handles?: "rope" | "flat" | "none" }
  | { type: "pouch"; w: number; h: number; d: number; color: string; front?: string; logo?: string; logoColor?: string }
  | { type: "carrier"; cups: 2 | 4; color: string; logo?: string; logoColor?: string };

export interface Specs {
  size?: string;
  material?: string;
  colours?: string[];
  use?: string;
  useAr?: string;
  notes?: string;
}

export interface DesignRow {
  id: number;
  slug: string;
  category: string;
  nameEn: string;
  nameAr: string;
  status: string;
  specs: Specs;
  model: StoredModel | null;
  images: string[];
  files: string[];
  updatedAt: string;
  activeShares: number;
  proposals: number;
  openOrders: number;
  missing: string[];
}

export interface VersionRow {
  id: number;
  number: number;
  status: "current" | "superseded" | "proposed" | "rejected";
  note: string | null;
  images: string[];
  files: string[];
  model: StoredModel | null;
  author: string;
  shareId: number | null;
  decidedBy: string | null;
  decisionNote: string | null;
  createdAt: string;
}

export interface CommentRow {
  id: number;
  versionId: number | null;
  shareId: number | null;
  recipient: string | null;
  author: string;
  fromStaff: boolean;
  body: string;
  createdAt: string;
}

export interface OrderRow {
  id: number;
  printer: string;
  quantity: number;
  unit: string;
  dueDate: string | null;
  status: string;
  notes: string | null;
  timeline: { at: string; status: string; by: string; note?: string }[];
  createdAt: string;
}

export interface ShareRow {
  id: number;
  recipient: string;
  expiresAt: string;
  maxViews: number;
  views: number;
  failedPins: number;
  revokedAt: string | null;
  revokedReason: string | null;
  allowSubmit: boolean;
  allowFiles: boolean;
  createdAt: string;
  lastOpenedAt: string | null;
  opens: { at: string; ip: string | null }[];
}

export const CATEGORIES = ["cups", "boxes", "paper", "signage", "cards", "uniform", "bags", "social", "menu", "other"];
export const STATUSES = ["draft", "review", "approved", "print"];
export const PRINT_STEPS = ["requested", "proofing", "proof_approved", "printing", "delivered"];

export const asset = (p: string, dl = false) => `/api/staff/asset?path=${encodeURIComponent(p)}${dl ? "&dl=1" : ""}`;
export const isImage = (p: string) => /\.(png|jpe?g|webp|gif|svg)$/i.test(p);
export const fileName = (p: string) => (p.split("/").pop() ?? p).replace(/^(sub-\d+-)?[a-z0-9]{6,9}-/, "");

/** The stored model points at brand-file paths; the viewer needs URLs. */
export function toViewer(m: StoredModel, url: (p: string) => string = (p) => asset(p)): Model3D {
  switch (m.type) {
    case "cup": return { ...m, texture: url(m.texture) };
    case "box": return { ...m, logo: url(m.logo) };
    case "card": return { ...m, logo: url(m.logo), symbol: url(m.symbol) };
    case "flat": return { ...m, front: url(m.front), back: m.back ? url(m.back) : undefined };
    case "bag": return { ...m, logo: url(m.logo), front: m.front ? url(m.front) : undefined };
    case "pouch": return { ...m, logo: m.logo ? url(m.logo) : undefined, front: m.front ? url(m.front) : undefined };
    case "carrier": return { ...m, logo: m.logo ? url(m.logo) : undefined };
  }
}

export function cover(d: Pick<DesignRow, "images" | "model">): string | null {
  if (d.images[0] && isImage(d.images[0])) return d.images[0];
  if (d.model?.type === "flat") return d.model.front;
  if (d.model?.type === "cup") return d.model.texture;
  return null;
}

export function mainColour(m: StoredModel | null): string | null {
  if (!m) return null;
  if (m.type === "card") return m.bg;
  if ("color" in m) return m.color;
  return null;
}

/** Sends one file to the design's store; returns its path. */
export async function uploadDesignFile(designId: number, file: File): Promise<string> {
  const r = await fetch(`/api/staff/admin/designs/${designId}/upload?name=${encodeURIComponent(file.name)}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/octet-stream" },
    body: file,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.message || j.error || String(r.status));
  return j.path as string;
}

/** Sensible starting models, so a new box or bag has a 3D view before anything is uploaded. */
export function defaultModel(type: StoredModel["type"]): StoredModel | null {
  switch (type) {
    case "box": return { type: "box", L: 200, W: 150, H: 80, color: "#FE5000", logoColor: "#F1E9DA", logo: "logos/svg/logo-primary-color.svg" };
    case "card": return { type: "card", w: 90, h: 50, bg: "#FE5000", logo: "logos/svg/logo-primary-color.svg", logoColor: "#F1E9DA", backBg: "#F1E9DA", symbol: "logos/svg/logo-icon-color.svg", symbolColor: "#FE5000" };
    case "bag": return { type: "bag", w: 260, h: 320, d: 140, color: "#F1E9DA", logoColor: "#FE5000", logo: "logos/svg/logo-primary-color.svg", handles: "rope" };
    case "pouch": return { type: "pouch", w: 140, h: 220, d: 80, color: "#2A1F15", logo: "logos/svg/logo-primary-color.svg", logoColor: "#C08B3D" };
    case "carrier": return { type: "carrier", cups: 4, color: "#C8B79A", logo: "logos/svg/logo-icon-color.svg", logoColor: "#FE5000" };
    default: return null;
  }
}
