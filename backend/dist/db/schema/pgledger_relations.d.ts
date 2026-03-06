export declare const pgledgerAccountsRelations: import("drizzle-orm").Relations<"pgledger_accounts", {
    entries: import("drizzle-orm").Many<"pgledger_entries">;
    transfersFrom: import("drizzle-orm").Many<"pgledger_transfers">;
    transfersTo: import("drizzle-orm").Many<"pgledger_transfers">;
}>;
export declare const pgledgerTransfersRelations: import("drizzle-orm").Relations<"pgledger_transfers", {
    fromAccount: import("drizzle-orm").One<"pgledger_accounts", true>;
    toAccount: import("drizzle-orm").One<"pgledger_accounts", true>;
    entries: import("drizzle-orm").Many<"pgledger_entries">;
}>;
export declare const pgledgerEntriesRelations: import("drizzle-orm").Relations<"pgledger_entries", {
    account: import("drizzle-orm").One<"pgledger_accounts", true>;
    transfer: import("drizzle-orm").One<"pgledger_transfers", true>;
}>;
//# sourceMappingURL=pgledger_relations.d.ts.map