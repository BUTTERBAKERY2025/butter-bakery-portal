import { eq } from "drizzle-orm";
import { db, brandFilesTable, type Design } from "@workspace/db";
import type { Response } from "express";

/** Every brand_files path a design's viewer needs: model textures first, then gallery images. */
export function viewerPaths(d: Pick<Design, "model" | "images">): string[] {
  const m = d.model;
  const out: string[] = [];
  if (m?.type === "cup") out.push(m.texture);
  if (m?.type === "box") out.push(m.logo);
  if (m?.type === "card") out.push(m.logo, m.symbol);
  if (m?.type === "flat") {
    out.push(m.front);
    if (m.back) out.push(m.back);
  }
  for (const p of d.images ?? []) if (!out.includes(p)) out.push(p);
  return out;
}

export async function sendBrandPath(res: Response, path: string, cache = "private, max-age=600") {
  const [f] = await db.select().from(brandFilesTable).where(eq(brandFilesTable.path, path)).limit(1);
  if (!f) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.setHeader("Content-Type", f.mime);
  res.setHeader("Content-Length", String(f.size));
  res.setHeader("Cache-Control", cache);
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (f.mime.startsWith("image/svg")) {
    res.setHeader("Content-Security-Policy", "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; sandbox");
  }
  res.end(f.data);
}
