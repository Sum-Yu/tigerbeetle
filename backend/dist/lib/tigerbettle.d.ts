import { AccountFlags } from "tigerbeetle-node";
export declare const tbClient: import("tigerbeetle-node").Client;
/** Ledger 1 = SGD (Singapore), Ledger 2 = USD */
export declare function buildTbAccount(ledger?: number): {
    id: bigint;
    debits_pending: bigint;
    debits_posted: bigint;
    credits_pending: bigint;
    credits_posted: bigint;
    user_data_128: bigint;
    user_data_64: bigint;
    user_data_32: number;
    reserved: number;
    ledger: number;
    code: number;
    flags: AccountFlags;
    timestamp: bigint;
};
//# sourceMappingURL=tigerbettle.d.ts.map