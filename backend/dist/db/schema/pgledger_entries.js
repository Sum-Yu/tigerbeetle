import { pgTable, text, timestamp, numeric, bigint } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { pgledgerAccounts } from "./pgledger_accounts.js";
import { pgledgerTransfers } from "./pgledger_transfers.js";
export const pgledgerEntries = pgTable("pgledger_entries", {
    id: text("id")
        .primaryKey()
        .default(sql `pgledger_generate_id('pgle')`),
    accountId: text("account_id")
        .notNull()
        .references(() => pgledgerAccounts.id),
    transferId: text("transfer_id")
        .notNull()
        .references(() => pgledgerTransfers.id),
    amount: numeric("amount", { precision: 20, scale: 4 }).notNull().default("0"),
    accountPreviousBalance: numeric("account_previous_balance", {
        precision: 20,
        scale: 4,
    }).notNull(),
    accountCurrentBalance: numeric("account_current_balance", {
        precision: 20,
        scale: 4,
    }).notNull(),
    accountVersion: bigint("account_version", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});
//# sourceMappingURL=pgledger_entries.js.map