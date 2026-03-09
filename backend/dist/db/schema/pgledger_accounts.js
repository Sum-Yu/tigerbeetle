import { pgTable, text, timestamp, bigint, boolean, jsonb, } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
export const pgledgerAccounts = pgTable("pgledger_accounts", {
    id: text("id")
        .primaryKey()
        .default(sql `pgledger_generate_id('pgla')`),
    name: text("name").notNull(),
    email: text("email").notNull(),
    currency: text("currency").notNull(),
    balance: bigint("balance", { mode: "bigint" }).notNull().default(0n),
    version: bigint("version", { mode: "number" }).notNull().default(0),
    allowNegativeBalance: boolean("allow_negative_balance").notNull(),
    allowPositiveBalance: boolean("allow_positive_balance").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});
//# sourceMappingURL=pgledger_accounts.js.map