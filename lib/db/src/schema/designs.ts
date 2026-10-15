import { pgTable, serial, text, integer, jsonb, timestamp, index, boolean, date } from "drizzle-orm/pg-core";
import { staffUsersTable } from "./staff";

/**
 * The design office: every cup, box, paper, sign, card and uniform, with its 3D model.
 * Images and print files are paths into brand_files, so nothing is stored twice.
 */
export type DesignModel =
  | { type: "cup"; oz: string; colour: string; texture: string }
  | { type: "box"; L: number; W: number; H: number; color: string; logoColor: string; logo: string }
  | { type: "flat"; w: number; h: number; d?: number; front: string; back?: string; standing?: boolean }
  | { type: "card"; w: number; h: number; bg: string; logo: string; logoColor: string; backBg: string; symbol: string; symbolColor: string }
  | { type: "bag"; w: number; h: number; d: number; color: string; logoColor: string; logo: string; front?: string; handles?: "rope" | "flat" | "none" }
  | { type: "pouch"; w: number; h: number; d: number; color: string; front?: string; logo?: string; logoColor?: string }
  | { type: "carrier"; cups: 2 | 4; color: string; logo?: string; logoColor?: string };

export interface DesignSpecs {
  size?: string;
  material?: string;
  colours?: string[];
  use?: string;
  useAr?: string;
  notes?: string;
}

export const designsTable = pgTable(
  "designs",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull(), // cups | boxes | paper | signage | cards | uniform | bags | social | menu
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
    status: text("status").notNull().default("draft"), // draft | review | approved | print
    specs: jsonb("specs").$type<DesignSpecs>().notNull().default({}),
    model: jsonb("model").$type<DesignModel | null>(),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    files: jsonb("files").$type<string[]>().notNull().default([]),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("designs_category_idx").on(t.category)],
);

/** A protected, expiring link that shows one design (view only) to someone outside the company. */
export const designSharesTable = pgTable(
  "design_shares",
  {
    id: serial("id").primaryKey(),
    tokenHash: text("token_hash").notNull().unique(),
    designId: integer("design_id")
      .notNull()
      .references(() => designsTable.id, { onDelete: "cascade" }),
    recipient: text("recipient").notNull(),
    note: text("note"),
    pinHash: text("pin_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    maxViews: integer("max_views").notNull().default(20),
    views: integer("views").notNull().default(0),
    failedPins: integer("failed_pins").notNull().default(0),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedReason: text("revoked_reason"),
    /** The recipient may upload a revision and leave comments. */
    allowSubmit: boolean("allow_submit").notNull().default(false),
    /** The recipient may download the print files (for a printer). */
    allowFiles: boolean("allow_files").notNull().default(false),
    createdBy: integer("created_by").references(() => staffUsersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),
  },
  (t) => [index("design_shares_design_idx").on(t.designId)],
);

/**
 * A snapshot of a design's images, files and 3D model. "current" is what the design shows now;
 * a designer's upload arrives as "proposed" until an admin approves or rejects it.
 */
export const designVersionsTable = pgTable(
  "design_versions",
  {
    id: serial("id").primaryKey(),
    designId: integer("design_id")
      .notNull()
      .references(() => designsTable.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    status: text("status").notNull().default("current"), // current | superseded | proposed | rejected
    note: text("note"),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    files: jsonb("files").$type<string[]>().notNull().default([]),
    model: jsonb("model").$type<DesignModel | null>(),
    specs: jsonb("specs").$type<DesignSpecs>(),
    author: text("author").notNull(), // staff username or "link:<recipient>"
    shareId: integer("share_id").references(() => designSharesTable.id, { onDelete: "set null" }),
    decidedBy: text("decided_by"),
    decisionNote: text("decision_note"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("design_versions_design_idx").on(t.designId)],
);

/** Discussion on a design. shareId set = visible to that link's recipient too. */
export const designCommentsTable = pgTable(
  "design_comments",
  {
    id: serial("id").primaryKey(),
    designId: integer("design_id")
      .notNull()
      .references(() => designsTable.id, { onDelete: "cascade" }),
    versionId: integer("version_id").references(() => designVersionsTable.id, { onDelete: "set null" }),
    shareId: integer("share_id").references(() => designSharesTable.id, { onDelete: "cascade" }),
    author: text("author").notNull(),
    fromStaff: boolean("from_staff").notNull().default(true),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("design_comments_design_idx").on(t.designId)],
);

export type PrintStatus = "requested" | "proofing" | "proof_approved" | "printing" | "delivered" | "cancelled";

/** A print run of one version of a design. */
export const printOrdersTable = pgTable(
  "print_orders",
  {
    id: serial("id").primaryKey(),
    designId: integer("design_id")
      .notNull()
      .references(() => designsTable.id, { onDelete: "cascade" }),
    versionId: integer("version_id").references(() => designVersionsTable.id, { onDelete: "set null" }),
    printer: text("printer").notNull(),
    quantity: integer("quantity").notNull(),
    unit: text("unit").notNull().default("pcs"),
    dueDate: date("due_date"),
    status: text("status").$type<PrintStatus>().notNull().default("requested"),
    notes: text("notes"),
    timeline: jsonb("timeline").$type<{ at: string; status: string; by: string; note?: string }[]>().notNull().default([]),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("print_orders_design_idx").on(t.designId)],
);

export type Design = typeof designsTable.$inferSelect;
export type DesignVersion = typeof designVersionsTable.$inferSelect;
export type PrintOrder = typeof printOrdersTable.$inferSelect;
export type DesignShare = typeof designSharesTable.$inferSelect;
