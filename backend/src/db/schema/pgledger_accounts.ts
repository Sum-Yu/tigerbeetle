import {
  pgTable,
  text,
  timestamp,
  bigint,
  boolean,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const pgledgerAccounts = pgTable("pgledger_accounts", {
  id: text("id")
    .primaryKey()
    .default(sql`pgledger_generate_id('pgla')`),
  name: text("name").notNull(),
  currency: text("currency").notNull(),
  balance: numeric("balance", { precision: 20, scale: 4 }).notNull().default("0"),
  version: bigint("version", { mode: "number" }).notNull().default(0),
  allowNegativeBalance: boolean("allow_negative_balance").notNull(),
  allowPositiveBalance: boolean("allow_positive_balance").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PgledgerAccount = typeof pgledgerAccounts.$inferSelect;
export type NewPgledgerAccount = typeof pgledgerAccounts.$inferInsert;
