import express, { Router, type IRouter, type Request } from "express";
import crypto from "node:crypto";
import { and, asc, desc, eq, inArray, max, ne, sql } from "drizzle-orm";
import {
  db,
  designsTable,
  designSharesTable,
  designVersionsTable,
  designCommentsTable,
  printOrdersTable,
  brandFilesTable,
  staffAccessLogTable,
  staffUsersTable,
  type DesignModel,
  type DesignSpecs,
  type PrintStatus,
} from "@workspace/db";
import { requireAdmin, requireStaff, hashPassword, audit } from "../lib/staffAuth";
import { sendBrandPath, viewerPaths, storeDesignFile, UPLOAD_EXT, modelPaths } from "../lib/designAssets";

/**
 * The design office (admin only): designs, versions, uploads, comments, share links and print orders.
 * Session loading and no-store headers for /staff/* come from the staff router, mounted first.
 */
const router: IRouter = Router();

const STATUSES = ["draft", "review", "approved", "print"];
const CATEGORIES = ["cups", "boxes", "paper", "signage", "cards", "uniform", "bags", "social", "menu", "other"];
const PRINT_STATUSES: PrintStatus[] = ["requested", "proofing", "proof_approved", "printing", "delivered", "cancelled"];
const HEX = /^#[0-9a-fA-F]{6}$/;

const who = (req: Request) => req.staff!.username;

// ---------------- validation ----------------
const num = (v: unknown, lo: number, hi: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= lo && n <= hi ? n : null;
};
const str = (v: unknown, n = 300) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const paths = (v: unknown) => (Array.isArray(v) ? v.filter((p): p is string => typeof p === "string" && !p.includes("..")).slice(0, 40) : []);

function cleanSpecs(v: unknown, prev: DesignSpecs = {}): DesignSpecs {
  const b = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const out: DesignSpecs = { ...prev };
  for (const k of ["size", "material", "use", "useAr", "notes"] as const) if (b[k] !== undefined) out[k] = str(b[k], k === "notes" ? 2000 : 300);
  if (b.colours !== undefined) out.colours = Array.isArray(b.colours) ? b.colours.map((c) => str(c, 60)).filter(Boolean).slice(0, 12) : [];
  return out;
}

/** Returns a safe model or a string explaining what is wrong. */
function cleanModel(v: unknown): DesignModel | null | string {
  if (v === null || v === undefined) return null;
  const m = v as Record<string, unknown>;
  const p = (k: string) => (typeof m[k] === "string" && !(m[k] as string).includes("..") ? (m[k] as string) : "");
  const colour = (k: string, d: string) => (typeof m[k] === "string" && HEX.test(m[k] as string) ? (m[k] as string) : d);
  switch (m.type) {
    case "cup": {
      if (!p("texture")) return "A cup needs its print artwork (texture).";
      const oz = ["4", "9", "12", "16"].includes(String(m.oz)) ? String(m.oz) : "12";
      return { type: "cup", oz, colour: str(m.colour, 20) || "morning", texture: p("texture") };
    }
    case "box": {
      const L = num(m.L, 20, 1200), W = num(m.W, 20, 1200), H = num(m.H, 5, 600);
      if (!L || !W || !H) return "Box sizes must be in mm (L 20–1200, W 20–1200, H 5–600).";
      return { type: "box", L, W, H, color: colour("color", "#FE5000"), logoColor: colour("logoColor", "#F1E9DA"), logo: p("logo") || "logos/svg/logo-primary-color.svg" };
    }
    case "card":
      return {
        type: "card", w: num(m.w, 20, 300) ?? 90, h: num(m.h, 20, 300) ?? 50, bg: colour("bg", "#FE5000"),
        logo: p("logo") || "logos/svg/logo-primary-color.svg", logoColor: colour("logoColor", "#F1E9DA"),
        backBg: colour("backBg", "#F1E9DA"), symbol: p("symbol") || "logos/svg/logo-icon-color.svg", symbolColor: colour("symbolColor", "#FE5000"),
      };
    case "flat": {
      if (!p("front")) return "A flat design needs a front image.";
      const w = num(m.w, 5, 20000), h = num(m.h, 5, 20000);
      if (!w || !h) return "Width and height must be in mm.";
      return { type: "flat", w, h, d: num(m.d, 0.05, 200) ?? 1, front: p("front"), ...(p("back") ? { back: p("back") } : {}), standing: m.standing !== false };
    }
    case "bag": {
      const w = num(m.w, 50, 800), h = num(m.h, 50, 900), d = num(m.d, 20, 400);
      if (!w || !h || !d) return "Bag sizes must be in mm.";
      const handles = m.handles === "flat" || m.handles === "none" ? m.handles : "rope";
      return { type: "bag", w, h, d, color: colour("color", "#F1E9DA"), logoColor: colour("logoColor", "#FE5000"), logo: p("logo") || "logos/svg/logo-primary-color.svg", ...(p("front") ? { front: p("front") } : {}), handles };
    }
    case "pouch": {
      const w = num(m.w, 50, 500), h = num(m.h, 80, 600), d = num(m.d, 20, 200);
      if (!w || !h || !d) return "Pouch sizes must be in mm.";
      return { type: "pouch", w, h, d, color: colour("color", "#2A1F15"), ...(p("front") ? { front: p("front") } : {}), logo: p("logo") || "logos/svg/logo-primary-color.svg", logoColor: colour("logoColor", "#C08B3D") };
    }
    case "carrier":
      return { type: "carrier", cups: m.cups === 2 ? 2 : 4, color: colour("color", "#C8B79A"), logo: p("logo") || "logos/svg/logo-icon-color.svg", logoColor: colour("logoColor", "#FE5000") };
    default:
      return "Unknown 3D model type.";
  }
}

async function nextVersionNumber(designId: number) {
  const [r] = await db.select({ n: max(designVersionsTable.number) }).from(designVersionsTable).where(eq(designVersionsTable.designId, designId));
  return (r?.n ?? 0) + 1;
}

/** Records the design's current state as a new "current" version. */
async function snapshot(designId: number, author: string, note: string | null) {
  const [d] = await db.select().from(designsTable).where(eq(designsTable.id, designId)).limit(1);
  if (!d) return;
  await db.update(designVersionsTable).set({ status: "superseded" }).where(and(eq(designVersionsTable.designId, designId), eq(designVersionsTable.status, "current")));
  await db.insert(designVersionsTable).values({
    designId, number: await nextVersionNumber(designId), status: "current", note, images: d.images, files: d.files, model: d.model, specs: d.specs, author,
  });
}

// ---------------- files ----------------
/** Admins open any brand or design file by path (images, print files, uploads). */
router.get("/staff/asset", requireAdmin, async (req, res) => {
  const path = String(req.query.path ?? "");
  if (!path || path.includes("..")) { res.status(404).end(); return; }
  const dl = req.query.dl === "1";
  if (dl) await audit(req, "download", { path });
  await sendBrandPath(res, path, "private, max-age=600", dl);
});

/** Logo files for the 3D viewer: any signed-in staff member (they're in the shareable tier anyway). */
router.get("/staff/logo", requireStaff, async (req, res) => {
  const path = String(req.query.path ?? "");
  if (!/^logos\/svg\/[\w.\-]+\.svg$/.test(path)) { res.status(404).end(); return; }
  await sendBrandPath(res, path);
});

router.post(
  "/staff/admin/designs/:id/upload",
  requireAdmin,
  express.raw({ type: () => true, limit: "80mb" }),
  async (req, res) => {
    const id = Number(req.params.id);
    const name = str(req.query.name, 120);
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (!name || !UPLOAD_EXT.includes(ext)) { res.status(400).json({ error: "bad_type", message: `Allowed: ${UPLOAD_EXT.join(", ")}` }); return; }
    if (!Buffer.isBuffer(req.body) || !req.body.length) { res.status(400).json({ error: "empty" }); return; }
    const [d] = await db.select({ slug: designsTable.slug }).from(designsTable).where(eq(designsTable.id, id)).limit(1);
    if (!d) { res.status(404).json({ error: "not_found" }); return; }
    const path = await storeDesignFile(d.slug, "", name, req.body);
    await audit(req, "admin", { detail: `uploaded ${path}` });
    res.status(201).json({ path, size: req.body.length });
  },
);

// ---------------- summary for the home page ----------------
router.get("/staff/admin/summary", requireAdmin, async (_req, res) => {
  const byStatus = await db.select({ status: designsTable.status, n: sql<number>`count(*)::int` }).from(designsTable).groupBy(designsTable.status);
  const now = new Date();
  const [links] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(designSharesTable)
    .where(sql`${designSharesTable.revokedAt} is null and ${designSharesTable.expiresAt} > ${now} and ${designSharesTable.views} < ${designSharesTable.maxViews}`);
  const proposals = await db
    .select({ id: designVersionsTable.id, designId: designVersionsTable.designId, author: designVersionsTable.author, createdAt: designVersionsTable.createdAt, nameEn: designsTable.nameEn, nameAr: designsTable.nameAr })
    .from(designVersionsTable)
    .innerJoin(designsTable, eq(designsTable.id, designVersionsTable.designId))
    .where(eq(designVersionsTable.status, "proposed"))
    .orderBy(desc(designVersionsTable.createdAt))
    .limit(20);
  const orders = await db
    .select({ id: printOrdersTable.id, designId: printOrdersTable.designId, printer: printOrdersTable.printer, quantity: printOrdersTable.quantity, unit: printOrdersTable.unit, status: printOrdersTable.status, dueDate: printOrdersTable.dueDate, nameEn: designsTable.nameEn, nameAr: designsTable.nameAr })
    .from(printOrdersTable)
    .innerJoin(designsTable, eq(designsTable.id, printOrdersTable.designId))
    .where(sql`${printOrdersTable.status} not in ('delivered','cancelled')`)
    .orderBy(asc(printOrdersTable.dueDate))
    .limit(20);
  const [files] = await db.select({ n: sql<number>`count(*)::int` }).from(brandFilesTable).where(ne(brandFilesTable.section, "designs"));
  const [users] = await db.select({ n: sql<number>`count(*)::int` }).from(staffUsersTable).where(eq(staffUsersTable.active, true));
  const recent = await db.select().from(staffAccessLogTable).orderBy(desc(staffAccessLogTable.at)).limit(8);
  res.json({
    designs: Object.fromEntries(byStatus.map((r) => [r.status, r.n])),
    activeLinks: links?.n ?? 0,
    proposals,
    orders,
    files: files?.n ?? 0,
    users: users?.n ?? 0,
    recent,
  });
});

// ---------------- designs ----------------
router.get("/staff/admin/designs", requireAdmin, async (_req, res) => {
  const designs = await db.select().from(designsTable).orderBy(asc(designsTable.category), asc(designsTable.sort), asc(designsTable.id));
  const shares = await db
    .select({ designId: designSharesTable.designId, expiresAt: designSharesTable.expiresAt, revokedAt: designSharesTable.revokedAt, views: designSharesTable.views, maxViews: designSharesTable.maxViews })
    .from(designSharesTable);
  const proposed = await db.select({ designId: designVersionsTable.designId }).from(designVersionsTable).where(eq(designVersionsTable.status, "proposed"));
  const open = await db.select({ designId: printOrdersTable.designId }).from(printOrdersTable).where(sql`${printOrdersTable.status} not in ('delivered','cancelled')`);
  const count = (rows: { designId: number }[]) => rows.reduce((m, r) => m.set(r.designId, (m.get(r.designId) ?? 0) + 1), new Map<number, number>());
  const now = Date.now();
  const active = count(shares.filter((s) => !s.revokedAt && s.expiresAt.getTime() > now && s.views < s.maxViews));
  const prop = count(proposed);
  const ord = count(open);
  const allPaths = [...new Set(designs.flatMap((d) => [...viewerPaths(d), ...(d.files ?? [])]))];
  const found = allPaths.length
    ? new Set((await db.select({ path: brandFilesTable.path }).from(brandFilesTable).where(inArray(brandFilesTable.path, allPaths))).map((r) => r.path))
    : new Set<string>();
  res.json({
    designs: designs.map((d) => ({
      ...d,
      activeShares: active.get(d.id) ?? 0,
      proposals: prop.get(d.id) ?? 0,
      openOrders: ord.get(d.id) ?? 0,
      missing: [...viewerPaths(d), ...(d.files ?? [])].filter((p) => !found.has(p)),
    })),
  });
});

router.post("/staff/admin/designs", requireAdmin, async (req, res) => {
  const b = req.body ?? {};
  const nameEn = str(b.nameEn, 120), nameAr = str(b.nameAr, 120);
  if (!nameEn || !nameAr) { res.status(400).json({ error: "names_required", message: "Write the name in English and Arabic." }); return; }
  const category = CATEGORIES.includes(b.category) ? b.category : "other";
  const model = cleanModel(b.model);
  if (typeof model === "string") { res.status(400).json({ error: "bad_model", message: model }); return; }
  const slug = `${nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "design"}-${crypto.randomBytes(3).toString("hex")}`;
  const [d] = await db
    .insert(designsTable)
    .values({ slug, category, nameEn, nameAr, status: "draft", specs: cleanSpecs(b.specs), model, images: paths(b.images), files: paths(b.files), sort: 1000 })
    .returning();
  await snapshot(d!.id, who(req), str(b.versionNote, 300) || "First version");
  await audit(req, "admin", { detail: `created design ${slug}` });
  res.status(201).json({ design: d });
});

router.patch("/staff/admin/designs/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [d] = await db.select().from(designsTable).where(eq(designsTable.id, id)).limit(1);
  if (!d) { res.status(404).json({ error: "not_found" }); return; }
  const b = req.body ?? {};
  const set: Partial<typeof designsTable.$inferInsert> = { updatedAt: new Date() };
  let content = false;
  if (b.status !== undefined) {
    if (!STATUSES.includes(b.status)) { res.status(400).json({ error: "bad_status" }); return; }
    set.status = b.status;
  }
  if (b.nameEn !== undefined) set.nameEn = str(b.nameEn, 120) || d.nameEn;
  if (b.nameAr !== undefined) set.nameAr = str(b.nameAr, 120) || d.nameAr;
  if (b.category !== undefined && CATEGORIES.includes(b.category)) set.category = b.category;
  if (b.specs !== undefined) set.specs = cleanSpecs(b.specs, d.specs ?? {});
  if (b.notes !== undefined) set.specs = { ...(set.specs ?? d.specs ?? {}), notes: str(b.notes, 2000) };
  if (b.model !== undefined) {
    const m = cleanModel(b.model);
    if (typeof m === "string") { res.status(400).json({ error: "bad_model", message: m }); return; }
    set.model = m;
    content = true;
  }
  if (b.images !== undefined) { set.images = paths(b.images); content = true; }
  if (b.files !== undefined) { set.files = paths(b.files); content = true; }
  const [u] = await db.update(designsTable).set(set).where(eq(designsTable.id, id)).returning();
  // Changing the images, files or 3D model makes a new version, so earlier ones can be compared or restored.
  if (content) await snapshot(id, who(req), str(b.versionNote, 300) || null);
  await audit(req, "admin", { detail: `design ${d.slug}: ${Object.keys(b).join(", ")}` });
  res.json({ design: u });
});

router.delete("/staff/admin/designs/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [d] = await db.delete(designsTable).where(eq(designsTable.id, id)).returning({ slug: designsTable.slug });
  if (!d) { res.status(404).json({ error: "not_found" }); return; }
  await audit(req, "admin", { detail: `deleted design ${d.slug}` });
  res.json({ ok: true });
});

// ---------------- versions ----------------
router.get("/staff/admin/designs/:id/versions", requireAdmin, async (req, res) => {
  const rows = await db.select().from(designVersionsTable).where(eq(designVersionsTable.designId, Number(req.params.id))).orderBy(desc(designVersionsTable.number));
  res.json({ versions: rows });
});

async function decide(req: Request, approve: boolean) {
  const vid = Number(req.params.vid);
  const [v] = await db.select().from(designVersionsTable).where(eq(designVersionsTable.id, vid)).limit(1);
  if (!v) return { code: 404, body: { error: "not_found" } };
  const note = str(req.body?.note, 1000) || null;
  if (approve) {
    if (v.status === "current") return { code: 400, body: { error: "already_current" } };
    // Approving a proposal or restoring an old version: it becomes the design's content.
    await db.update(designVersionsTable).set({ status: "superseded" }).where(and(eq(designVersionsTable.designId, v.designId), eq(designVersionsTable.status, "current")));
    await db
      .update(designsTable)
      .set({ images: v.images, files: v.files, model: v.model ?? undefined, ...(v.specs ? { specs: v.specs } : {}), updatedAt: new Date(), status: "review" })
      .where(eq(designsTable.id, v.designId));
    await db.update(designVersionsTable).set({ status: "current", decidedBy: who(req), decisionNote: note, decidedAt: new Date() }).where(eq(designVersionsTable.id, vid));
  } else {
    if (v.status !== "proposed") return { code: 400, body: { error: "not_a_proposal" } };
    await db.update(designVersionsTable).set({ status: "rejected", decidedBy: who(req), decisionNote: note, decidedAt: new Date() }).where(eq(designVersionsTable.id, vid));
  }
  if (note && v.shareId) {
    await db.insert(designCommentsTable).values({ designId: v.designId, versionId: vid, shareId: v.shareId, author: who(req), fromStaff: true, body: note });
  }
  await audit(req, "admin", { detail: `${approve ? "approved" : "rejected"} version ${v.number} of design ${v.designId}` });
  return { code: 200, body: { ok: true } };
}
router.post("/staff/admin/versions/:vid/approve", requireAdmin, async (req, res) => {
  const r = await decide(req, true);
  res.status(r.code).json(r.body);
});
router.post("/staff/admin/versions/:vid/reject", requireAdmin, async (req, res) => {
  const r = await decide(req, false);
  res.status(r.code).json(r.body);
});

// ---------------- comments ----------------
router.get("/staff/admin/designs/:id/comments", requireAdmin, async (req, res) => {
  const rows = await db
    .select({ c: designCommentsTable, recipient: designSharesTable.recipient })
    .from(designCommentsTable)
    .leftJoin(designSharesTable, eq(designSharesTable.id, designCommentsTable.shareId))
    .where(eq(designCommentsTable.designId, Number(req.params.id)))
    .orderBy(asc(designCommentsTable.createdAt));
  res.json({ comments: rows.map((r) => ({ ...r.c, recipient: r.recipient })) });
});
router.post("/staff/admin/designs/:id/comments", requireAdmin, async (req, res) => {
  const body = str(req.body?.body, 2000);
  if (!body) { res.status(400).json({ error: "empty" }); return; }
  const shareId = req.body?.shareId ? Number(req.body.shareId) : null;
  const [c] = await db.insert(designCommentsTable).values({ designId: Number(req.params.id), shareId, author: who(req), fromStaff: true, body }).returning();
  res.status(201).json({ comment: c });
});

// ---------------- print orders ----------------
router.get("/staff/admin/designs/:id/orders", requireAdmin, async (req, res) => {
  const rows = await db.select().from(printOrdersTable).where(eq(printOrdersTable.designId, Number(req.params.id))).orderBy(desc(printOrdersTable.createdAt));
  res.json({ orders: rows });
});
router.post("/staff/admin/designs/:id/orders", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const b = req.body ?? {};
  const printer = str(b.printer, 120);
  const quantity = num(b.quantity, 1, 10_000_000);
  if (!printer || !quantity) { res.status(400).json({ error: "bad_order", message: "Printer and quantity are required." }); return; }
  const [cur] = await db.select({ id: designVersionsTable.id }).from(designVersionsTable).where(and(eq(designVersionsTable.designId, id), eq(designVersionsTable.status, "current"))).limit(1);
  const due = typeof b.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.dueDate) ? b.dueDate : null;
  const [o] = await db
    .insert(printOrdersTable)
    .values({
      designId: id, versionId: cur?.id ?? null, printer, quantity, unit: str(b.unit, 20) || "pcs", dueDate: due, notes: str(b.notes, 1000) || null,
      createdBy: who(req), timeline: [{ at: new Date().toISOString(), status: "requested", by: who(req) }],
    })
    .returning();
  await db.update(designsTable).set({ status: "print", updatedAt: new Date() }).where(eq(designsTable.id, id));
  await audit(req, "admin", { detail: `print order ${o!.id}: ${quantity} ${o!.unit} at ${printer}` });
  res.status(201).json({ order: o });
});
router.patch("/staff/admin/orders/:oid", requireAdmin, async (req, res) => {
  const oid = Number(req.params.oid);
  const [o] = await db.select().from(printOrdersTable).where(eq(printOrdersTable.id, oid)).limit(1);
  if (!o) { res.status(404).json({ error: "not_found" }); return; }
  const status = req.body?.status as PrintStatus;
  if (!PRINT_STATUSES.includes(status)) { res.status(400).json({ error: "bad_status" }); return; }
  const note = str(req.body?.note, 500) || undefined;
  const [u] = await db
    .update(printOrdersTable)
    .set({ status, updatedAt: new Date(), timeline: [...(o.timeline ?? []), { at: new Date().toISOString(), status, by: who(req), ...(note ? { note } : {}) }] })
    .where(eq(printOrdersTable.id, oid))
    .returning();
  await audit(req, "admin", { detail: `print order ${oid} → ${status}` });
  res.json({ order: u });
});

// ---------------- share links ----------------
router.get("/staff/admin/designs/:id/shares", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const rows = await db.select().from(designSharesTable).where(eq(designSharesTable.designId, id)).orderBy(desc(designSharesTable.createdAt));
  const opens = rows.length
    ? await db
        .select()
        .from(staffAccessLogTable)
        .where(and(eq(staffAccessLogTable.action, "share_open"), inArray(staffAccessLogTable.path, rows.map((r) => `share:${r.id}`))))
        .orderBy(desc(staffAccessLogTable.at))
        .limit(300)
    : [];
  res.json({
    shares: rows.map(({ tokenHash: _t, pinHash: _p, ...s }) => ({ ...s, opens: opens.filter((o) => o.path === `share:${s.id}`).map((o) => ({ at: o.at, ip: o.ip })) })),
  });
});

router.post("/staff/admin/designs/:id/shares", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [d] = await db.select({ id: designsTable.id, slug: designsTable.slug }).from(designsTable).where(eq(designsTable.id, id)).limit(1);
  if (!d) { res.status(404).json({ error: "not_found" }); return; }
  const b = req.body ?? {};
  const recipient = str(b.recipient, 120);
  if (!recipient) { res.status(400).json({ error: "recipient_required", message: "Who is this link for?" }); return; }
  const hours = Math.min(Math.max(Number(b.hours) || 72, 1), 24 * 30);
  const maxViews = Math.min(Math.max(Number(b.maxViews) || 10, 1), 200);
  const token = crypto.randomBytes(24).toString("base64url");
  const pin = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const [s] = await db
    .insert(designSharesTable)
    .values({
      tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
      designId: d.id, recipient, note: str(b.note, 300) || null, pinHash: hashPassword(pin),
      expiresAt: new Date(Date.now() + hours * 3600_000), maxViews, createdBy: req.staff!.id,
      allowSubmit: b.allowSubmit === true, allowFiles: b.allowFiles === true,
    })
    .returning();
  await audit(req, "admin", { detail: `share link for ${d.slug} → ${recipient} (${hours}h, ${maxViews} opens${s!.allowSubmit ? ", can submit" : ""}${s!.allowFiles ? ", print files" : ""})` });
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

export { modelPaths };
export default router;
