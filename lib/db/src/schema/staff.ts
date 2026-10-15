import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  customType,
  index,
} from "drizzle-orm/pg-core";

/** Raw binary column (Postgres bytea), used to keep brand files out of git. */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

/** none = hidden, view = open in the browser, download = view + save the file. */
export type StaffAccess = "none" | "view" | "download";
export type StaffPermissions = Record<string, StaffAccess>;

export const staffUsersTable = pgTable("staff_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  permissions: jsonb("permissions").$type<StaffPermissions>().notNull().default({}),
  active: boolean("active").notNull().default(true),
  /** Optional end date for temporary accounts (suppliers, agencies). */
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const staffSessionsTable = pgTable(
  "staff_sessions",
  {
    /** sha256 of the cookie token; the token itself is never stored. */
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => staffUsersTable.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("staff_sessions_user_idx").on(t.userId)],
);

export const brandFilesTable = pgTable(
  "brand_files",
  {
    id: serial("id").primaryKey(),
    /** Path inside the brand package, e.g. logos/svg/logo-primary-color.svg */
    path: text("path").notNull().unique(),
    section: text("section").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    sha256: text("sha256").notNull(),
    data: bytea("data").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("brand_files_section_idx").on(t.section)],
);

export const staffAccessLogTable = pgTable(
  "staff_access_log",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => staffUsersTable.id, { onDelete: "set null" }),
    username: text("username"),
    action: text("action").notNull(), // login | login_failed | logout | view | download | admin
    path: text("path"),
    detail: text("detail"),
    ip: text("ip"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("staff_access_log_at_idx").on(t.at)],
);

export type StaffUser = typeof staffUsersTable.$inferSelect;
export type BrandFile = typeof brandFilesTable.$inferSelect;
