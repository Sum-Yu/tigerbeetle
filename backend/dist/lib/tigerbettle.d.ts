import { AccountFlags } from "tigerbeetle-node";
export declare const tbClient: import("tigerbeetle-node").Client;
export declare function buildTbAccount(): {
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