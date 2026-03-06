import { relations } from "drizzle-orm";
import { pgledgerAccounts } from "./pgledger_accounts.js";
import { pgledgerTransfers } from "./pgledger_transfers.js";
import { pgledgerEntries } from "./pgledger_entries.js";

export const pgledgerAccountsRelations = relations(pgledgerAccounts, ({ many }) => ({
  entries: many(pgledgerEntries),
  transfersFrom: many(pgledgerTransfers, { relationName: "fromAccount" }),
  transfersTo: many(pgledgerTransfers, { relationName: "toAccount" }),
}));

export const pgledgerTransfersRelations = relations(pgledgerTransfers, ({ one, many }) => ({
  fromAccount: one(pgledgerAccounts, {
    fields: [pgledgerTransfers.fromAccountId],
    references: [pgledgerAccounts.id],
    relationName: "fromAccount",
  }),
  toAccount: one(pgledgerAccounts, {
    fields: [pgledgerTransfers.toAccountId],
    references: [pgledgerAccounts.id],
    relationName: "toAccount",
  }),
  entries: many(pgledgerEntries),
}));

export const pgledgerEntriesRelations = relations(pgledgerEntries, ({ one }) => ({
  account: one(pgledgerAccounts, {
    fields: [pgledgerEntries.accountId],
    references: [pgledgerAccounts.id],
  }),
  transfer: one(pgledgerTransfers, {
    fields: [pgledgerEntries.transferId],
    references: [pgledgerTransfers.id],
  }),
}));
