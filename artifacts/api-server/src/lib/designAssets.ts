import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, brandFilesTable, type Design, type DesignModel } from "@workspace/db";
import type { Response } from "express";

const MIME: Record<string, string> = {
  svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif",
  pdf: "application/pdf", ai: "application/postscript", eps: "application/postscript", psd: "image/vnd.adobe.photoshop",
  zip: "application/zip", glb: "model/gltf-binary", txt: "text/plain; charset=utf-8",
};
export const UPLOAD_EXT = Object.keys(MIME);
export const mimeOf = (name: string) => MIME[name.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";

/** Keeps letters (Arabic too), digits, dot, dash; everything else becomes "_". */
export function safeName(name: string): string {
  const n = name.normalize("NFC").replace(/[^\p{L}\p{N}.\-]+/gu, "_").replace(/_+/g, "_").slice(-80);
  return n.replace(/^[._]+/, "") || "file";
}

/** Stores an uploaded design file next to the brand files (section "designs" never appears in the library). */
export async function storeDesignFile(slug: string, prefix: string, name: string, data: Buffer): Promise<string> {
  const path = `designs/${slug}/${prefix}${Date.now().toString(36)}-${safeName(name)}`;
  await db.insert(brandFilesTable).values({
    path,
    section: "designs",
    mime: mimeOf(name),
    size: data.length,
    sha256: crypto.createHash("sha256").update(data).digest("hex"),
    data,
  });
  return path;
}

/** Every brand_files path a 3D model needs. */
export function modelPaths(m: DesignModel | null | undefined): string[] {
  if (!m) return [];
  switch (m.type) {
    case "cup": return [m.texture];
    case "box": return [m.logo];
    case "card": return [m.logo, m.symbol];
    case "flat": return m.back ? [m.front, m.back] : [m.front];
    case "bag": return [m.logo, ...(m.front ? [m.front] : [])];
    case "pouch": return [...(m.front ? [m.front] : []), ...(m.logo ? [m.logo] : [])];
    case "carrier": return m.logo ? [m.logo] : [];
  }
}

/** Every brand_files path a design's viewer needs: model textures first, then gallery images. */
export function viewerPaths(d: Pick<Design, "model" | "images">): string[] {
  const out = modelPaths(d.model);
  for (const p of d.images ?? []) if (!out.includes(p)) out.push(p);
  return out;
}

export async function sendBrandPath(res: Response, path: string, cache = "private, max-age=600", download = false) {
  const [f] = await db.select().from(brandFilesTable).where(eq(brandFilesTable.path, path)).limit(1);
  if (!f) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.setHeader("Content-Type", f.mime);
  res.setHeader("Content-Length", String(f.size));
  res.setHeader("Cache-Control", cache);
  res.setHeader("X-Content-Type-Options", "nosniff");
  const name = (path.split("/").pop() ?? "file").replace(/[^\w.\-]/g, "_");
  const inline = !download && (f.mime.startsWith("image/") || f.mime === "application/pdf");
  res.setHeader("Content-Disposition", `${inline ? "inline" : "attachment"}; filename="${name}"`);
  if (f.mime.startsWith("image/svg")) {
    res.setHeader("Content-Security-Policy", "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; sandbox");
  }
  res.end(f.data);
}
