import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db, designsTable, designSharesTable, brandFilesTable, staffAccessLogTable } from "@workspace/db";
import { requireAdmin, hashPassword, audit } from "../lib/staffAuth";
import { sendBrandPath, viewerPaths } from "../lib/designAssets";

const router: IRouter = Router();
// Session loading and no-store headers for /staff/* come from the staff router, mounted first.

const STATUSES = ["draft", "review", "approved", "print"];

/** Admins open any brand file by path (design images, print files). */
router.get("/staff/asset", requireAdmin, async (req, res) => {
  const path = String(req.query.path ?? "");
  if (!path || path.includes("..")) { res.status(404).end(); return; }
  if (req.query.dl === "1") {
    res.setHeader("Content-Disposition", `attachment; filename="${(path.split("/").pop() ?? "file").replace(/[^\w.\-]/g, "_")}"`);
    await audit(req, "download", { path });
  }
  await sendBrandPath(res, path);
});

router.get("/staff/admin/designs", requireAdmin, async (_req, res) => {
  const designs = await db.select().from(designsTable).orderBy(asc(designsTable.category), asc(designsTable.sort), asc(designsTable.id));
  const shares = await db
    .select({ designId: designSharesTable.designId, expiresAt: designSharesTable.expiresAt, revokedAt: designSharesTable.revokedAt, views: designSharesTable.views, maxViews: designSharesTable.maxViews })
    .from(designSharesTable);
  const now = Date.now();
  const active = new Map<number, number>();
  for (const s of shares) if (!s.revokedAt && s.expiresAt.getTime() > now && s.views < s.maxViews) active.set(s.designId, (active.get(s.designId) ?? 0) + 1);
  // Which referenced files actually exist, so the office can flag broken references.
  const paths = [...new Set(designs.flatMap((d) => [...viewerPaths(d), ...(d.files ?? [])]))];
  const found = paths.length
    ? new Set((await db.select({ path: brandFilesTable.path }).from(brandFilesTable).where(inArray(brandFilesTable.path, paths))).map((r) => r.path))
    : new Set<string>();
  res.json({
    designs: designs.map((d) => ({ ...d, activeShares: active.get(d.id) ?? 0, missing: [...viewerPaths(d), ...(d.files ?? [])].filter((p) => !found.has(p)) })),
  });
});

router.patch("/staff/admin/designs/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [d] = await db.select().from(designsTable).where(eq(designsTable.id, id)).limit(1);
  if (!d) { res.status(404).json({ error: "not_found" }); return; }
  const b = req.body ?? {};
  const set: Partial<typeof designsTable.$inferInsert> = { updatedAt: new Date() };
  if (b.status !== undefined) {
    if (!STATUSES.includes(b.status)) { res.status(400).json({ error: "bad_status" }); return; }
    set.status = b.status;
  }
  if (b.nameEn !== undefined) set.nameEn = String(b.nameEn).slice(0, 120);
  if (b.nameAr !== undefined) set.nameAr = String(b.nameAr).slice(0, 120);
  if (b.notes !== undefined) set.specs = { ...(d.specs ?? {}), notes: String(b.notes).slice(0, 2000) };
  const [u] = await db.update(designsTable).set(set).where(eq(designsTable.id, id)).returning();
  await audit(req, "admin", { detail: `design ${d.slug}: ${Object.keys(b).join(", ")}` });
  res.json({ design: u });
});

// ---------------- share links ----------------
router.get("/staff/admin/designs/:id/shares", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const rows = await db.select().from(designSharesTable).where(eq(designSharesTable.designId, id)).orderBy(desc(designSharesTable.createdAt));
  const opens = await db
    .select()
    .from(staffAccessLogTable)
    .where(and(eq(staffAccessLogTable.action, "share_open"), inArray(staffAccessLogTable.path, rows.length ? rows.map((r) => `share:${r.id}`) : ["-"])))
    .orderBy(desc(staffAccessLogTable.at))
    .limit(200);
  res.json({
    shares: rows.map(({ tokenHash: _t, pinHash: _p, ...s }) => ({
      ...s,
      opens: opens.filter((o) => o.path === `share:${s.id}`).map((o) => ({ at: o.at, ip: o.ip })),
    })),
  });
});

router.post("/staff/admin/designs/:id/shares", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [d] = await db.select({ id: designsTable.id, slug: designsTable.slug }).from(designsTable).where(eq(designsTable.id, id)).limit(1);
  if (!d) { res.status(404).json({ error: "not_found" }); return; }
  const b = req.body ?? {};
  const recipient = String(b.recipient ?? "").trim().slice(0, 120);
  if (!recipient) { res.status(400).json({ error: "recipient_required", message: "Who is this link for?" }); return; }
  const hours = Math.min(Math.max(Number(b.hours) || 72, 1), 24 * 30);
  const maxViews = Math.min(Math.max(Number(b.maxViews) || 10, 1), 200);
  const token = crypto.randomBytes(24).toString("base64url");
  const pin = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const [s] = await db
    .insert(designSharesTable)
    .values({
      tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
      designId: d.id,
      recipient,
      note: b.note ? String(b.note).slice(0, 300) : null,
      pinHash: hashPassword(pin),
      expiresAt: new Date(Date.now() + hours * 3600_000),
      maxViews,
      createdBy: req.staff!.id,
    })
    .returning();
  await audit(req, "admin", { detail: `share link for ${d.slug} → ${recipient} (${hours}h, ${maxViews} opens)` });
  // The token and PIN are shown once; only their hashes are stored.
  res.status(201).json({ id: s!.id, path: `/share/${token}`, pin, expiresAt: s!.expiresAt, maxViews });
});

router.post("/staff/admin/shares/:sid/revoke", requireAdmin, async (req, res) => {
  const sid = Number(req.params.sid);
  const [s] = await db
    .update(designSharesTable)
    .set({ revokedAt: new Date(), revokedReason: "admin" })
    .where(eq(designSharesTable.id, sid))
    .returning({ id: designSharesTable.id, recipient: designSharesTable.recipient });
  if (!s) { res.status(404).json({ error: "not_found" }); return; }
  await audit(req, "admin", { detail: `revoked share link ${sid} (${s.recipient})` });
  res.json({ ok: true });
});

export default router;
