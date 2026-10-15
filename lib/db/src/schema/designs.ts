import { pgTable, serial, text, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { staffUsersTable } from "./staff";

/**
 * The design office: every cup, box, paper, sign, card and uniform, with its 3D model.
 * Images and print files are paths into brand_files, so nothing is stored twice.
 */
export type DesignModel =
  | { type: "cup"; oz: string; colour: string; texture: string }
  | { type: "box"; L: number; W: number; H: number; color: string; logoColor: string; logo: string }
  | { type: "flat"; w: number; h: number; d?: number; front: string; back?: string; standing?: boolean }
  | { type: "card"; w: number; h: number; bg: string; logo: string; logoColor: string; backBg: string; symbol: string; symbolColor: string };

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
    createdBy: integer("created_by").references(() => staffUsersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),
  },
  (t) => [index("design_shares_design_idx").on(t.designId)],
);

export type Design = typeof designsTable.$inferSelect;
export type DesignShare = typeof designSharesTable.$inferSelect;
