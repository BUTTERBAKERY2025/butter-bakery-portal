import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db, designsTable, designSharesTable, type DesignShare } from "@workspace/db";
import { verifyPassword, DUMMY_HASH, audit, clientIp, throttled, noteFail, clearFails } from "../lib/staffAuth";
import { sendBrandPath, viewerPaths } from "../lib/designAssets";

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

router.get("/share/:token/design", async (req, res) => {
  const r = await unlockedDesign(req, res);
  if (!r) return;
  const { s, d } = r;
  const paths = viewerPaths(d);
  const url = (p: string) => `/api/share/${req.params.token}/asset/${paths.indexOf(p)}`;
  const m = d.model;
  const model =
    m?.type === "cup" ? { ...m, texture: url(m.texture) }
    : m?.type === "box" ? { ...m, logo: url(m.logo) }
    : m?.type === "flat" ? { ...m, front: url(m.front), back: m.back ? url(m.back) : undefined }
    : m?.type === "card" ? { ...m, logo: url(m.logo), symbol: url(m.symbol) }
    : null;
  res.json({
    recipient: s.recipient,
    expiresAt: s.expiresAt,
    design: {
      nameEn: d.nameEn,
      nameAr: d.nameAr,
      category: d.category,
      status: d.status,
      specs: { size: d.specs?.size, material: d.specs?.material, colours: d.specs?.colours, use: d.specs?.use, useAr: d.specs?.useAr },
      model,
      images: (d.images ?? []).map(url),
    },
  });
});

router.get("/share/:token/asset/:i", async (req, res) => {
  const r = await unlockedDesign(req, res);
  if (!r) return;
  const path = viewerPaths(r.d)[Number(req.params.i)];
  if (!path) { res.status(404).end(); return; }
  res.setHeader("Content-Disposition", "inline");
  await sendBrandPath(res, path, "private, no-store");
});

export default router;
