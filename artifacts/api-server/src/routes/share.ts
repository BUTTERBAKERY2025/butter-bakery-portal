import express, { Router, type IRouter, type Request, type Response } from "express";
import crypto from "node:crypto";
import { and, asc, desc, eq, max, sql } from "drizzle-orm";
import { db, designsTable, designSharesTable, designVersionsTable, designCommentsTable, type Design, type DesignShare, type DesignModel } from "@workspace/db";
import { verifyPassword, DUMMY_HASH, audit, clientIp, throttled, noteFail, clearFails } from "../lib/staffAuth";
import { sendBrandPath, viewerPaths, storeDesignFile, UPLOAD_EXT } from "../lib/designAssets";

/**
 * Public, view-only design links: /share/<token> + a 6-digit PIN.
 * Only hashes of the token and PIN are stored. A link stops working when it expires,
 * reaches its open limit, is revoked by an admin, or after 10 wrong PINs.
 */
const router: IRouter = Router();

const SECRET = crypto
  .createHash("sha256")
  .update(`bb-share:${process.env.SHARE_SECRET ?? process.env.DATABASE_PASSWORD ?? process.env.DATABASE_URL ?? crypto.randomBytes(16).toString("hex")}`)
  .digest();
const COOKIE = "bb_share";
const SESSION_MS = 2 * 3600_000;
const MAX_FAILED = 10;

router.use("/share", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const sign = (v: string) => crypto.createHmac("sha256", SECRET).update(v).digest("base64url");

type State = "ok" | "expired" | "revoked" | "used_up" | "not_found";
function stateOf(s: DesignShare | undefined): State {
  if (!s) return "not_found";
  if (s.revokedAt) return "revoked";
  if (s.expiresAt.getTime() <= Date.now()) return "expired";
  if (s.views >= s.maxViews) return "used_up";
  return "ok";
}

async function findShare(token: string) {
  if (!/^[\w-]{20,64}$/.test(token)) return undefined;
  const [s] = await db.select().from(designSharesTable).where(eq(designSharesTable.tokenHash, sha(token))).limit(1);
  return s;
}

/** A valid unlock cookie for this share, or null. Opening the design again inside 2 hours doesn't use up an open. */
function sessionOk(req: Request, s: DesignShare): boolean {
  const raw = req.cookies?.[COOKIE];
  if (typeof raw !== "string") return false;
  const [id, exp, mac] = raw.split(".");
  if (Number(id) !== s.id || !exp || !mac) return false;
  if (Number(exp) < Date.now()) return false;
  const good = sign(`${id}.${exp}`);
  return good.length === mac.length && crypto.timingSafeEqual(Buffer.from(good), Buffer.from(mac));
}

router.get("/share/:token", async (req, res) => {
  const s = await findShare(req.params.token);
  const state = stateOf(s);
  if (state !== "ok") { res.status(state === "not_found" ? 404 : 410).json({ state }); return; }
  res.json({ state, unlocked: sessionOk(req, s!), expiresAt: s!.expiresAt });
});

router.post("/share/:token/unlock", async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const key = `share|${clientIp(req)}|${sha(token).slice(0, 16)}`;
  if (throttled(key)) { res.status(429).json({ state: "too_many_attempts" }); return; }
  const s = await findShare(token);
  const state = stateOf(s);
  const pin = String(req.body?.pin ?? "").replace(/\D/g, "");
  if (state !== "ok") {
    verifyPassword(pin || "000000", DUMMY_HASH);
    res.status(state === "not_found" ? 404 : 410).json({ state });
    return;
  }
  if (!verifyPassword(pin, s!.pinHash)) {
    noteFail(key);
    const failed = s!.failedPins + 1;
    await db
      .update(designSharesTable)
      .set({ failedPins: failed, ...(failed >= MAX_FAILED ? { revokedAt: new Date(), revokedReason: "too_many_wrong_pins" } : {}) })
      .where(eq(designSharesTable.id, s!.id));
    await audit(req, "share_pin_failed", { username: `link:${s!.recipient}`, path: `share:${s!.id}` });
    res.status(401).json({ state: failed >= MAX_FAILED ? "revoked" : "wrong_pin" });
    return;
  }
  clearFails(key);
  await db
    .update(designSharesTable)
    .set({ views: sql`${designSharesTable.views} + 1`, lastOpenedAt: new Date() })
    .where(eq(designSharesTable.id, s!.id));
  await audit(req, "share_open", { username: `link:${s!.recipient}`, path: `share:${s!.id}` });
  const exp = Math.min(Date.now() + SESSION_MS, s!.expiresAt.getTime());
  res.cookie(COOKIE, `${s!.id}.${exp}.${sign(`${s!.id}.${exp}`)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: `/api/share/${token}`,
    expires: new Date(exp),
  });
  res.json({ state: "ok" });
});

async function unlockedDesign(req: Request, res: Response) {
  const s = await findShare(req.params.token as string);
  // An unlocked session keeps working until it ends even if the last open was just used.
  if (!s || s.revokedAt || s.expiresAt.getTime() <= Date.now() || !sessionOk(req, s)) {
    res.status(401).json({ state: "locked" });
    return null;
  }
  const [d] = await db.select().from(designsTable).where(eq(designsTable.id, s.designId)).limit(1);
  if (!d) { res.status(404).json({ state: "not_found" }); return null; }
  return { s, d };
}

/** Paths this link may open: the viewer's files, print files if allowed, and the recipient's own uploads. */
async function allowedPaths(s: DesignShare, d: Design): Promise<Set<string>> {
  const out = new Set(viewerPaths(d));
  if (s.allowFiles) for (const f of d.files ?? []) out.add(f);
  const own = await db.select({ images: designVersionsTable.images, files: designVersionsTable.files }).from(designVersionsTable).where(eq(designVersionsTable.shareId, s.id));
  for (const v of own) for (const p of [...v.images, ...v.files]) out.add(p);
  return out;
}

const fileUrl = (token: string, p: string, dl = false) => `/api/share/${token}/file?p=${encodeURIComponent(p)}${dl ? "&dl=1" : ""}`;

function viewerModel(m: DesignModel | null, u: (p: string) => string) {
  if (!m) return null;
  switch (m.type) {
    case "cup": return { ...m, texture: u(m.texture) };
    case "box": return { ...m, logo: u(m.logo) };
    case "card": return { ...m, logo: u(m.logo), symbol: u(m.symbol) };
    case "flat": return { ...m, front: u(m.front), back: m.back ? u(m.back) : undefined };
    case "bag": return { ...m, logo: u(m.logo), front: m.front ? u(m.front) : undefined };
    case "pouch": return { ...m, logo: m.logo ? u(m.logo) : undefined, front: m.front ? u(m.front) : undefined };
    case "carrier": return { ...m, logo: m.logo ? u(m.logo) : undefined };
  }
}

router.get("/share/:token/design", async (req, res) => {
  const r = await unlockedDesign(req, res);
  if (!r) return;
  const { s, d } = r;
  const token = req.params.token as string;
  const u = (p: string) => fileUrl(token, p);
  const mine = s.allowSubmit
    ? await db.select().from(designVersionsTable).where(eq(designVersionsTable.shareId, s.id)).orderBy(desc(designVersionsTable.createdAt))
    : [];
  const comments = s.allowSubmit
    ? await db.select().from(designCommentsTable).where(eq(designCommentsTable.shareId, s.id)).orderBy(asc(designCommentsTable.createdAt))
    : [];
  res.json({
    recipient: s.recipient,
    expiresAt: s.expiresAt,
    allowSubmit: s.allowSubmit,
    allowFiles: s.allowFiles,
    design: {
      nameEn: d.nameEn,
      nameAr: d.nameAr,
      category: d.category,
      status: d.status,
      specs: { size: d.specs?.size, material: d.specs?.material, colours: d.specs?.colours, use: d.specs?.use, useAr: d.specs?.useAr },
      model: viewerModel(d.model, u),
      images: (d.images ?? []).map(u),
      files: s.allowFiles ? (d.files ?? []).map((f) => ({ name: f.split("/").pop(), url: fileUrl(token, f, true) })) : [],
    },
    submissions: mine.map((v) => ({
      number: v.number,
      status: v.status,
      note: v.note,
      decisionNote: v.decisionNote,
      createdAt: v.createdAt,
      images: v.images.map(u),
      files: v.files.map((f) => ({ name: f.split("/").pop(), url: fileUrl(token, f, true) })),
    })),
    comments: comments.map((c) => ({ id: c.id, author: c.fromStaff ? "Butter" : s.recipient, fromStaff: c.fromStaff, body: c.body, createdAt: c.createdAt })),
  });
});

router.get("/share/:token/file", async (req, res) => {
  const r = await unlockedDesign(req, res);
  if (!r) return;
  const p = String(req.query.p ?? "");
  if (!(await allowedPaths(r.s, r.d)).has(p)) { res.status(404).end(); return; }
  const dl = req.query.dl === "1";
  if (dl) await audit(req, "share_download", { username: `link:${r.s.recipient}`, path: p });
  await sendBrandPath(res, p, "private, no-store", dl);
});

// ---------------- designer submissions ----------------
const MAX_UPLOADS_PER_LINK = 60;

router.post("/share/:token/upload", express.raw({ type: () => true, limit: "60mb" }), async (req, res) => {
  const r = await unlockedDesign(req, res);
  if (!r) return;
  if (!r.s.allowSubmit) { res.status(403).json({ error: "not_allowed" }); return; }
  const name = String(req.query.name ?? "").slice(0, 120);
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (!name || !UPLOAD_EXT.includes(ext)) { res.status(400).json({ error: "bad_type", allowed: UPLOAD_EXT }); return; }
  if (!Buffer.isBuffer(req.body) || !req.body.length) { res.status(400).json({ error: "empty" }); return; }
  const [{ n } = { n: 0 }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(sql`brand_files`)
    .where(sql`path like ${`designs/${r.d.slug}/sub-${r.s.id}-%`}`);
  if (n >= MAX_UPLOADS_PER_LINK) { res.status(429).json({ error: "too_many_files" }); return; }
  const path = await storeDesignFile(r.d.slug, `sub-${r.s.id}-`, name, req.body);
  res.status(201).json({ path });
});

router.post("/share/:token/submit", async (req, res) => {
  const r = await unlockedDesign(req, res);
  if (!r) return;
  const { s, d } = r;
  if (!s.allowSubmit) { res.status(403).json({ error: "not_allowed" }); return; }
  const own = (v: unknown) =>
    (Array.isArray(v) ? v : []).filter((p): p is string => typeof p === "string" && p.startsWith(`designs/${d.slug}/sub-${s.id}-`) && !p.includes("..")).slice(0, 30);
  const images = own(req.body?.images);
  const files = own(req.body?.files);
  const note = String(req.body?.note ?? "").trim().slice(0, 2000);
  if (!images.length && !files.length) { res.status(400).json({ error: "nothing_to_submit" }); return; }
  const [m] = await db.select({ n: max(designVersionsTable.number) }).from(designVersionsTable).where(eq(designVersionsTable.designId, d.id));
  const [v] = await db
    .insert(designVersionsTable)
    .values({ designId: d.id, number: (m?.n ?? 0) + 1, status: "proposed", note: note || null, images: images.length ? images : d.images, files: files.length ? files : d.files, model: d.model, specs: d.specs, author: `link:${s.recipient}`, shareId: s.id })
    .returning();
  if (note) await db.insert(designCommentsTable).values({ designId: d.id, versionId: v!.id, shareId: s.id, author: `link:${s.recipient}`, fromStaff: false, body: note });
  await audit(req, "share_submit", { username: `link:${s.recipient}`, path: `share:${s.id}`, detail: `version ${v!.number} of ${d.slug}` });
  res.status(201).json({ number: v!.number });
});

router.post("/share/:token/comment", async (req, res) => {
  const r = await unlockedDesign(req, res);
  if (!r) return;
  if (!r.s.allowSubmit) { res.status(403).json({ error: "not_allowed" }); return; }
  const body = String(req.body?.body ?? "").trim().slice(0, 2000);
  if (!body) { res.status(400).json({ error: "empty" }); return; }
  await db.insert(designCommentsTable).values({ designId: r.d.id, shareId: r.s.id, author: `link:${r.s.recipient}`, fromStaff: false, body });
  await audit(req, "share_comment", { username: `link:${r.s.recipient}`, path: `share:${r.s.id}` });
  res.status(201).json({ ok: true });
});

export default router;
