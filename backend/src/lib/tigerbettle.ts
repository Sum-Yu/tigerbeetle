import { createClient, AccountFlags } from "tigerbeetle-node"; // adjust import to your TB package
import { id } from "tigerbeetle-node"; // or wherever your id() comes from

// Match server.ts: support both TB_ADDRESS and TB_ADDRESSES
const TB_CLUSTER_ID = BigInt(process.env.TB_CLUSTER_ID ?? "0");
const TB_ADDRESSES = (
  process.env.TB_ADDRESSES ?? process.env.TB_ADDRESS ?? "3000"
).split(",");

// Create & export a single client instance
export const tbClient = createClient({
  cluster_id: TB_CLUSTER_ID,
  replica_addresses: TB_ADDRESSES,
});

/** Ledger 1 = SGD (Singapore), Ledger 2 = USD */
export function buildTbAccount(ledger: number = 1) {
  return {
    id: id(),
    debits_pending: 0n,
    debits_posted: 0n,
    credits_pending: 0n,
    credits_posted: 0n,
    user_data_128: 0n,
    user_data_64: 0n,
    user_data_32: 0,
    reserved: 0,
    ledger,
    code: 1,
    flags: AccountFlags.history,
    timestamp: 0n,
  };
}
