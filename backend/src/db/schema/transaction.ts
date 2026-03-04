import {
  pgTable,
  uuid,
  bigint,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user.js";

export const transactionTypeEnum = [
  "topup",
  "transfer",
  "debit",
  "credit",
] as const;

export const transaction = pgTable("transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  amount: bigint("amount", { mode: "number" }).notNull(),
  type: varchar("type", { length: 32 }).notNull(), // topup | transfer | debit | credit
  description: text("description"),
  // Optional reference to TigerBeetle transfer id
  tigerbeetleTransferId: text("tigerbeetle_transfer_id"),
  metadata: text("metadata"), // JSON string for extra data
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
    relationName: "userTransactions",
  }),
}));

export type Transaction = typeof transaction.$inferSelect;
export type NewTransaction = typeof transaction.$inferInsert;
