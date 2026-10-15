import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { and, eq, gt, lt } from "drizzle-orm";
import {
  db,
  staffUsersTable,
  staffSessionsTable,
  staffAccessLogTable,
  BRAND_SECTIONS,
  type StaffUser,
  type StaffAccess,
  type StaffPermissions,
} from "@workspace/db";
import { logger } from "./logger";

export const COOKIE = "bb_staff";
const SESSION_HOURS = 12;

// ---------- passwords (scrypt, no extra dependency) ----------
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [kind, saltB64, hashB64] = stored.split("$");
  if (kind !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, "base64"), expected.length, SCRYPT);
  return crypto.timingSafeEqual(actual, expected);
}

/** A dummy hash so unknown usernames take as long as real ones. */
export const DUMMY_HASH = hashPassword(crypto.randomBytes(12).toString("hex"));

export function passwordProblem(password: unknown): string | null {
  if (typeof password !== "string" || password.length < 10) return "Password must be at least 10 characters.";
  if (password.length > 200) return "Password is too long.";
  return null;
}

// ---------- sessions ----------
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function createSession(res: Response, userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000);
  await db.insert(staffSessionsTable).values({ id: sha(token), userId, expiresAt });
  // Housekeeping: drop expired sessions.
  await db.delete(staffSessionsTable).where(lt(staffSessionsTable.expiresAt, new Date()));
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(req: Request, res: Response) {
  const token = req.cookies?.[COOKIE];
  if (typeof token === "string") await db.delete(staffSessionsTable).where(eq(staffSessionsTable.id, sha(token)));
  res.clearCookie(COOKIE, { path: "/" });
}

export function accountUsable(u: StaffUser): boolean {
  return u.active && (!u.expiresAt || u.expiresAt.getTime() > Date.now());
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      staff?: StaffUser;
    }
  }
}

export async function loadStaff(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE];
    if (typeof token === "string" && token.length > 20) {
      const rows = await db
        .select({ user: staffUsersTable })
        .from(staffSessionsTable)
        .innerJoin(staffUsersTable, eq(staffSessionsTable.userId, staffUsersTable.id))
        .where(and(eq(staffSessionsTable.id, sha(token)), gt(staffSessionsTable.expiresAt, new Date())))
        .limit(1);
      const u = rows[0]?.user;
      if (u && accountUsable(u)) req.staff = u;
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (!req.staff) { res.status(401).json({ error: "not_signed_in" }); return; }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.staff) { res.status(401).json({ error: "not_signed_in" }); return; }
  if (!req.staff.isAdmin) { res.status(403).json({ error: "admins_only" }); return; }
  next();
}

// ---------- permissions ----------
const RANK: Record<StaffAccess, number> = { none: 0, view: 1, download: 2 };

export function accessFor(u: StaffUser, sectionId: string): StaffAccess {
  if (u.isAdmin) return "download";
  const a = (u.permissions as StaffPermissions)?.[sectionId];
  return a === "view" || a === "download" ? a : "none";
}

export function allows(u: StaffUser, sectionId: string, need: "view" | "download") {
  return RANK[accessFor(u, sectionId)] >= RANK[need];
}

export function cleanPermissions(input: unknown): StaffPermissions {
  const out: StaffPermissions = {};
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  for (const s of BRAND_SECTIONS) {
    const v = src[s.id];
    out[s.id] = v === "view" || v === "download" ? v : "none";
  }
  return out;
}

// ---------- audit log ----------
export function clientIp(req: Request): string {
  const fwd = req.headers["x-forwarded-for"];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim();
  return first || req.socket.remoteAddress || "";
}

export async function audit(
  req: Request,
  action: string,
  extra: { userId?: number | null; username?: string | null; path?: string | null; detail?: string | null } = {},
) {
  try {
    await db.insert(staffAccessLogTable).values({
      userId: extra.userId ?? req.staff?.id ?? null,
      username: extra.username ?? req.staff?.username ?? null,
      action,
      path: extra.path ?? null,
      detail: extra.detail ?? null,
      ip: clientIp(req),
    });
  } catch (err) {
    logger.error({ err }, "audit log write failed");
  }
}

// ---------- login throttling (per IP + username, in memory) ----------
const fails = new Map<string, { n: number; until: number }>();
const WINDOW = 15 * 60_000;
const MAX_FAILS = 5;

export function throttled(key: string): boolean {
  const f = fails.get(key);
  return !!f && f.n >= MAX_FAILS && f.until > Date.now();
}
export function noteFail(key: string) {
  const f = fails.get(key);
  if (!f || f.until < Date.now()) fails.set(key, { n: 1, until: Date.now() + WINDOW });
  else f.n += 1;
}
export function clearFails(key: string) {
  fails.delete(key);
}

// ---------- first admin ----------
/** Creates the first admin from STAFF_ADMIN_USERNAME / STAFF_ADMIN_PASSWORD when no admin exists. */
export async function bootstrapAdmin() {
  const username = process.env.STAFF_ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.STAFF_ADMIN_PASSWORD;
  if (!username || !password) return;
  try {
    const admins = await db.select({ id: staffUsersTable.id }).from(staffUsersTable).where(eq(staffUsersTable.isAdmin, true)).limit(1);
    if (admins.length) return;
    const problem = passwordProblem(password);
    if (problem) {
      logger.warn({ problem }, "STAFF_ADMIN_PASSWORD rejected; first admin not created");
      return;
    }
    await db
      .insert(staffUsersTable)
      .values({ username, displayName: "Admin", passwordHash: hashPassword(password), isAdmin: true, permissions: {} })
      .onConflictDoNothing();
    logger.info({ username }, "First staff admin created");
  } catch (err) {
    logger.error({ err }, "Could not create first staff admin (has the schema been pushed?)");
  }
}
