import express, { Router, type IRouter, type Request, type Response } from "express";
import { importBrandZip } from "../lib/brandImport";
import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  db,
  staffUsersTable,
  staffSessionsTable,
  brandFilesTable,
  staffAccessLogTable,
  BRAND_SECTIONS,
  BRAND_PRESETS,
  type StaffUser,
} from "@workspace/db";
import {
  loadStaff,
  requireStaff,
  requireAdmin,
  createSession,
  destroySession,
  verifyPassword,
  hashPassword,
  passwordProblem,
  DUMMY_HASH,
  accountUsable,
  accessFor,
  allows,
  cleanPermissions,
  audit,
  clientIp,
  throttled,
  noteFail,
  clearFails,
} from "../lib/staffAuth";

const router: IRouter = Router();
router.use("/staff", loadStaff);

// Nothing under /staff may be cached by browsers or proxies.
router.use("/staff", (_req, res, next) => {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
});

const publicUser = (u: StaffUser) => ({
  id: u.id,
  username: u.username,
  displayName: u.displayName,
  isAdmin: u.isAdmin,
  active: u.active,
  expiresAt: u.expiresAt,
  note: u.note,
  createdAt: u.createdAt,
  lastLoginAt: u.lastLoginAt,
  permissions: cleanPermissions(u.permissions),
});

const sectionsFor = (u: StaffUser) =>
  BRAND_SECTIONS.map(({ prefixes: _p, ...s }) => ({ ...s, access: accessFor(u, s.id) }));

// ---------------- session ----------------
router.post("/staff/login", async (req: Request, res: Response) => {
  const username = String(req.body?.username ?? "").trim().toLowerCase().slice(0, 80);
  const password = String(req.body?.password ?? "");
  const key = `${clientIp(req)}|${username}`;
  if (throttled(key)) { res.status(429).json({ error: "too_many_attempts" }); return; }

  const [u] = username
    ? await db.select().from(staffUsersTable).where(eq(staffUsersTable.username, username)).limit(1)
    : [];
  const ok = verifyPassword(password, u?.passwordHash ?? DUMMY_HASH) && !!u;
  if (!ok || !u) {
    noteFail(key);
    await audit(req, "login_failed", { userId: u?.id ?? null, username: username || null });
    { res.status(401).json({ error: "wrong_credentials" }); return; }
  }
  if (!accountUsable(u)) {
    await audit(req, "login_failed", { userId: u.id, username: u.username, detail: "inactive_or_expired" });
    { res.status(403).json({ error: "account_disabled" }); return; }
  }
  clearFails(key);
  await createSession(res, u.id);
  await db.update(staffUsersTable).set({ lastLoginAt: new Date() }).where(eq(staffUsersTable.id, u.id));
  await audit(req, "login", { userId: u.id, username: u.username });
  res.json({ user: publicUser(u), sections: sectionsFor(u) });
});

router.post("/staff/logout", async (req, res) => {
  if (req.staff) await audit(req, "logout");
  await destroySession(req, res);
  res.json({ ok: true });
});

router.get("/staff/me", requireStaff, (req, res) => {
  res.json({ user: publicUser(req.staff!), sections: sectionsFor(req.staff!) });
});

router.post("/staff/me/password", requireStaff, async (req, res) => {
  const { current, next } = req.body ?? {};
  if (!verifyPassword(String(current ?? ""), req.staff!.passwordHash)) { res.status(400).json({ error: "wrong_current_password" }); return; }
  const problem = passwordProblem(next);
  if (problem) { res.status(400).json({ error: "weak_password", message: problem }); return; }
  await db.update(staffUsersTable).set({ passwordHash: hashPassword(next) }).where(eq(staffUsersTable.id, req.staff!.id));
  await audit(req, "password_changed");
  res.json({ ok: true });
});

// ---------------- library ----------------
router.get("/staff/files", requireStaff, async (req, res) => {
  const u = req.staff!;
  const visible = BRAND_SECTIONS.filter((s) => allows(u, s.id, "view")).map((s) => s.id);
  if (!visible.length) { res.json({ files: [] }); return; }
  const rows = await db
    .select({
      id: brandFilesTable.id,
      path: brandFilesTable.path,
      section: brandFilesTable.section,
      mime: brandFilesTable.mime,
      size: brandFilesTable.size,
      updatedAt: brandFilesTable.updatedAt,
    })
    .from(brandFilesTable)
    .where(inArray(brandFilesTable.section, visible))
    .orderBy(asc(brandFilesTable.path));
  res.json({ files: rows.map((f) => ({ ...f, canDownload: allows(u, f.section, "download") })) });
});

async function sendFile(req: Request, res: Response, mode: "view" | "download") {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(404).json({ error: "not_found" }); return; }
  const [meta] = await db
    .select({ section: brandFilesTable.section })
    .from(brandFilesTable)
    .where(eq(brandFilesTable.id, id))
    .limit(1);
  // Same answer for "missing" and "not allowed", so file ids can't be probed.
  if (!meta || !allows(req.staff!, meta.section, mode)) { res.status(404).json({ error: "not_found" }); return; }
  const [f] = await db.select().from(brandFilesTable).where(eq(brandFilesTable.id, id)).limit(1);
  if (!f) { res.status(404).json({ error: "not_found" }); return; }
  // Library thumbnails pass ?thumb=1 and are not logged; opening or saving a file is.
  if (!(mode === "view" && req.query.thumb === "1")) await audit(req, mode, { path: f.path });
  const name = f.path.split("/").pop() ?? "file";
  res.setHeader("Content-Type", f.mime);
  res.setHeader("Content-Length", String(f.size));
  res.setHeader("X-Content-Type-Options", "nosniff");
  // SVGs can carry script: if one is opened directly, run it in a locked-down sandbox.
  if (f.mime.startsWith("image/svg")) {
    res.setHeader("Content-Security-Policy", "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; sandbox");
  }
  res.setHeader(
    "Content-Disposition",
    `${mode === "download" ? "attachment" : "inline"}; filename="${name.replace(/[^\w.\-]/g, "_")}"`,
  );
  res.end(f.data);
}

router.get("/staff/files/:id/view", requireStaff, (req, res) => sendFile(req, res, "view"));
router.get("/staff/files/:id/download", requireStaff, (req, res) => sendFile(req, res, "download"));

// ---------------- admin ----------------
router.get("/staff/admin/meta", requireAdmin, async (_req, res) => {
  const counts = await db
    .select({ section: brandFilesTable.section, n: sql<number>`count(*)::int`, bytes: sql<number>`coalesce(sum(${brandFilesTable.size}),0)::bigint` })
    .from(brandFilesTable)
    .groupBy(brandFilesTable.section);
  res.json({
    sections: BRAND_SECTIONS.map(({ prefixes: _p, ...s }) => {
      const c = counts.find((x) => x.section === s.id);
      return { ...s, files: c?.n ?? 0, bytes: Number(c?.bytes ?? 0) };
    }),
    presets: BRAND_PRESETS,
  });
});

router.get("/staff/admin/users", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(staffUsersTable).orderBy(asc(staffUsersTable.username));
  res.json({ users: rows.map(publicUser) });
});

const USERNAME = /^[a-z0-9._-]{3,40}$/;

function parseExpiry(v: unknown): Date | null | "bad" {
  if (v === null || v === undefined || v === "") return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? "bad" : d;
}

router.post("/staff/admin/users", requireAdmin, async (req, res) => {
  const b = req.body ?? {};
  const username = String(b.username ?? "").trim().toLowerCase();
  if (!USERNAME.test(username)) { res.status(400).json({ error: "bad_username", message: "3-40 characters: a-z, 0-9, dot, dash, underscore." }); return; }
  const problem = passwordProblem(b.password);
  if (problem) { res.status(400).json({ error: "weak_password", message: problem }); return; }
  const expiresAt = parseExpiry(b.expiresAt);
  if (expiresAt === "bad") { res.status(400).json({ error: "bad_date" }); return; }
  const [exists] = await db.select({ id: staffUsersTable.id }).from(staffUsersTable).where(eq(staffUsersTable.username, username)).limit(1);
  if (exists) { res.status(409).json({ error: "username_taken" }); return; }
  const [u] = await db
    .insert(staffUsersTable)
    .values({
      username,
      displayName: String(b.displayName ?? username).trim().slice(0, 80) || username,
      passwordHash: hashPassword(b.password),
      isAdmin: b.isAdmin === true,
      permissions: cleanPermissions(b.permissions),
      expiresAt,
      note: b.note ? String(b.note).slice(0, 300) : null,
    })
    .returning();
  await audit(req, "admin", { detail: `created user ${username}` });
  res.status(201).json({ user: publicUser(u!) });
});

router.patch("/staff/admin/users/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [u] = await db.select().from(staffUsersTable).where(eq(staffUsersTable.id, id)).limit(1);
  if (!u) { res.status(404).json({ error: "not_found" }); return; }
  const b = req.body ?? {};
  const set: Partial<typeof staffUsersTable.$inferInsert> = {};
  const changes: string[] = [];
  if (b.displayName !== undefined) { set.displayName = String(b.displayName).trim().slice(0, 80) || u.username; changes.push("name"); }
  if (b.permissions !== undefined) { set.permissions = cleanPermissions(b.permissions); changes.push("permissions"); }
  if (b.note !== undefined) { set.note = b.note ? String(b.note).slice(0, 300) : null; changes.push("note"); }
  if (b.expiresAt !== undefined) {
    const e = parseExpiry(b.expiresAt);
    if (e === "bad") { res.status(400).json({ error: "bad_date" }); return; }
    set.expiresAt = e; changes.push("expiry");
  }
  const self = u.id === req.staff!.id;
  if (b.isAdmin !== undefined) {
    if (self && b.isAdmin !== true) { res.status(400).json({ error: "cannot_remove_own_admin" }); return; }
    set.isAdmin = b.isAdmin === true; changes.push("admin");
  }
  if (b.active !== undefined) {
    if (self && b.active !== true) { res.status(400).json({ error: "cannot_disable_self" }); return; }
    set.active = b.active === true; changes.push(b.active ? "enabled" : "disabled");
  }
  if (b.password !== undefined && b.password !== "") {
    const problem = passwordProblem(b.password);
    if (problem) { res.status(400).json({ error: "weak_password", message: problem }); return; }
    set.passwordHash = hashPassword(b.password); changes.push("password");
  }
  if (!changes.length) { res.json({ user: publicUser(u) }); return; }
  const [updated] = await db.update(staffUsersTable).set(set).where(eq(staffUsersTable.id, id)).returning();
  // A disabled account or a new password signs the person out everywhere.
  if ((set.active === false || set.passwordHash) && !self) await db.delete(staffSessionsTable).where(eq(staffSessionsTable.userId, id));
  await audit(req, "admin", { detail: `updated ${u.username}: ${changes.join(", ")}` });
  res.json({ user: publicUser(updated!) });
});

// Upload one brand package zip (main or print). Re-uploading updates changed files only.
router.post(
  "/staff/admin/import",
  requireAdmin,
  express.raw({ type: ["application/zip", "application/x-zip-compressed", "application/octet-stream"], limit: "80mb" }),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length < 22) { res.status(400).json({ error: "not_a_zip" }); return; }
    let result;
    try {
      result = await importBrandZip(new Uint8Array(req.body));
    } catch {
      res.status(400).json({ error: "not_a_zip", message: "The file could not be opened as a zip." });
      return;
    }
    await audit(req, "admin", { detail: `imported package: +${result.added} new, ${result.updated} updated` });
    res.json(result);
  },
);

router.get("/staff/admin/log", requireAdmin, async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 1000);
  const rows = await db.select().from(staffAccessLogTable).orderBy(desc(staffAccessLogTable.at)).limit(limit);
  res.json({ log: rows });
});

export default router;
