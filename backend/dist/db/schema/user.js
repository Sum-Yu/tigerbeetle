import { pgTable, uuid, varchar, timestamp, text, bigint, } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { transaction } from "./transaction.js";
export const user = pgTable("user", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    // Link to TigerBeetle account for ledger balance
    tigerbeetleAccountId: text("tigerbeetle_account_id").unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    balance: bigint("balance", { mode: "number" }).notNull().default(0),
});
export const userRelations = relations(user, ({ many }) => ({
    transactions: many(transaction, { relationName: "userTransactions" }),
}));
//# sourceMappingURL=user.js.map