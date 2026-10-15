import crypto from "node:crypto";
import { unzipSync } from "fflate";
import { eq } from "drizzle-orm";
import { db, brandFilesTable, sectionForPath } from "@workspace/db";

const MIME: Record<string, string> = {
  svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  pdf: "application/pdf", json: "application/json", md: "text/markdown; charset=utf-8",
  txt: "text/plain; charset=utf-8", ttf: "font/ttf", otf: "font/otf", woff: "font/woff", woff2: "font/woff2",
};

export interface ImportResult {
  added: number;
  updated: number;
  unchanged: number;
  skipped: string[];
}

/**
 * Loads one of the brand package zips (main or print) into the database.
 * Paths are taken relative to the package folder, so "butter-bakery-brand-v1/logos/x.svg" → "logos/x.svg".
 */
export async function importBrandZip(zip: Uint8Array): Promise<ImportResult> {
  const entries = unzipSync(zip, { filter: (f) => !f.name.endsWith("/") && !f.name.includes("__MACOSX") });
  const r: ImportResult = { added: 0, updated: 0, unchanged: 0, skipped: [] };
  for (const [name, data] of Object.entries(entries)) {
    const parts = name.split("/").filter(Boolean);
    if (parts.some((p) => p.startsWith(".") || p === "..")) continue;
    if (parts[0]?.startsWith("butter-bakery-brand")) parts.shift();
    const rel = parts.join("/");
    const section = sectionForPath(rel);
    if (!section) { r.skipped.push(rel); continue; }
    const buf = Buffer.from(data);
    const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
    const mime = MIME[rel.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
    const [cur] = await db.select({ sha256: brandFilesTable.sha256 }).from(brandFilesTable).where(eq(brandFilesTable.path, rel)).limit(1);
    if (cur?.sha256 === sha256) { r.unchanged++; continue; }
    await db
      .insert(brandFilesTable)
      .values({ path: rel, section: section.id, mime, size: buf.length, sha256, data: buf })
      .onConflictDoUpdate({ target: brandFilesTable.path, set: { section: section.id, mime, size: buf.length, sha256, data: buf, updatedAt: new Date() } });
    if (cur) r.updated++; else r.added++;
  }
  return r;
}
