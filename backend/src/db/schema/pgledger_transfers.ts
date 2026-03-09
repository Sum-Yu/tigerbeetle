import {
  pgTable,
  text,
  timestamp,
  numeric,
  jsonb,
  check,
  bigint,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { pgledgerAccounts } from "./pgledger_accounts.js";

export const pgledgerTransfers = pgTable(
  "pgledger_transfers",
  {
    id: text("id")
      .primaryKey()
      .default(sql`pgledger_generate_id('pglt')`),
    fromAccountId: text("from_account_id")
      .notNull()
      .references(() => pgledgerAccounts.id),
    toAccountId: text("to_account_id")
      .notNull()
      .references(() => pgledgerAccounts.id),
    amount: bigint("amount", { mode: "bigint" }).notNull().default(0n),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    eventAt: timestamp("event_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    metadata: jsonb("metadata"),
  },
  (self) => ({
    transferCheck: check(
      "pgledger_transfers_check",
      sql`(${self.amount} > 0 AND ${self.fromAccountId} <> ${self.toAccountId})`,
    ),
  }),
);

export type PgledgerTransfer = typeof pgledgerTransfers.$inferSelect;
export type NewPgledgerTransfer = typeof pgledgerTransfers.$inferInsert;
