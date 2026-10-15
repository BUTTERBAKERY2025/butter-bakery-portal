/**
 * Loads the unzipped brand package into the database so the staff portal can serve it.
 * The files never go into git (this repository is public).
 *
 *   DATABASE_URL=... pnpm --filter @workspace/scripts run brand:import /path/to/butter-bakery-brand-v1
 *
 * Unzip both zips (main + print) into the same folder first. Re-running updates changed
 * files and adds new ones; add --prune to delete files that are no longer in the folder.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { eq, notInArray } from "drizzle-orm";
import { db, pool, brandFilesTable, sectionForPath } from "@workspace/db";

const MIME: Record<string, string> = {
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".pdf": "application/pdf", ".json": "application/json",
  ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".ttf": "font/ttf", ".otf": "font/otf", ".woff": "font/woff", ".woff2": "font/woff2",
  ".ico": "image/x-icon", ".zip": "application/zip",
};

async function walk(dir: string, base = dir): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full, base)));
    else if (e.isFile()) out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const prune = args.includes("--prune");
  const root = args.find((a) => !a.startsWith("--"));
  if (!root) throw new Error("Pass the brand package folder, e.g. ./butter-bakery-brand-v1");
  if (!(await stat(root)).isDirectory()) throw new Error(`${root} is not a folder`);

  const files = await walk(root);
  let added = 0, updated = 0, same = 0;
  const skipped: string[] = [];
  const kept: string[] = [];
  for (const rel of files) {
    const section = sectionForPath(rel);
    if (!section) { skipped.push(rel); continue; }
    const data = await readFile(path.join(root, rel));
    const sha256 = crypto.createHash("sha256").update(data).digest("hex");
    const mime = MIME[path.extname(rel).toLowerCase()] ?? "application/octet-stream";
    kept.push(rel);
    const [cur] = await db.select({ sha256: brandFilesTable.sha256 }).from(brandFilesTable).where(eq(brandFilesTable.path, rel)).limit(1);
    if (cur?.sha256 === sha256) { same++; continue; }
    await db
      .insert(brandFilesTable)
      .values({ path: rel, section: section.id, mime, size: data.length, sha256, data })
      .onConflictDoUpdate({
        target: brandFilesTable.path,
        set: { section: section.id, mime, size: data.length, sha256, data, updatedAt: new Date() },
      });
    if (cur) updated++; else added++;
  }
  let removed = 0;
  if (prune && kept.length) {
    const r = await db.delete(brandFilesTable).where(notInArray(brandFilesTable.path, kept)).returning({ id: brandFilesTable.id });
    removed = r.length;
  }
  console.log(`added ${added}, updated ${updated}, unchanged ${same}, removed ${removed}`);
  if (skipped.length) console.log(`not in any section (skipped): ${skipped.join(", ")}`);
}

main()
  .catch((e) => { console.error(e instanceof Error ? e.message : e); process.exitCode = 1; })
  .finally(() => pool.end());
