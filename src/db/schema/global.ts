import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const schools = sqliteTable("schools", {
  id: text("id").primaryKey(), // UUID or nanoid
  npsn: text("npsn").unique().notNull(),
  name: text("name").notNull(), // Should be stored in UPPERCASE
  subdomain: text("subdomain").unique().notNull(),
  dbUrl: text("db_url").notNull(),
  dbToken: text("db_token"),
  status: text("status", { enum: ["PENDING", "ACTIVE", "SUSPENDED"] }).default("PENDING"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  subdomainIdx: index("subdomain_idx").on(table.subdomain),
  npsnIdx: index("npsn_idx").on(table.npsn),
}));

export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;
