import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient, id, AccountFlags, AccountFilterFlags, CreateTransferError, } from "tigerbeetle-node";
import userRoutes from "./routes/userRoutes.js";
import pgledgerRoutes from "./routes/pgledgerRoutes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT ?? 4000;
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/pgledger", pgledgerRoutes);
// Configure TigerBeetle client
const client = createClient({
    cluster_id: BigInt(process.env.TB_CLUSTER_ID ?? 0),
    replica_addresses: [process.env.TB_ADDRESS ?? "3000"],
});
// Create A Bank Account (Provider Account)
let TREASURY_ACCOUNT_ID = "2143405532528893555931184785396120149";
async function getOrCreateTreasuryAccountId() {
    if (TREASURY_ACCOUNT_ID) {
        return TREASURY_ACCOUNT_ID;
    }
    const account = {
        id: id(),
        debits_pending: 0n,
        debits_posted: 0n,
        credits_pending: 0n,
        credits_posted: 0n,
        user_data_128: 0n,
        user_data_64: 0n,
        user_data_32: 0,
        reserved: 0,
        ledger: 1,
        code: 1,
        flags: AccountFlags.history,
        timestamp: 0n,
    };
    const errors = await client.createAccounts([account]);
    if (errors.length > 0) {
        console.error("Failed to create treasury account:", errors);
        throw new Error("Failed to create treasury account");
    }
    TREASURY_ACCOUNT_ID = account.id.toString();
    console.log(`Created treasury (bank) account with id=${TREASURY_ACCOUNT_ID}. ` +
        "You can set TB_TREASURY_ACCOUNT_ID to reuse it persistently.");
    return TREASURY_ACCOUNT_ID;
}
function jsonifyBigInts(value) {
    return JSON.parse(JSON.stringify(value, (_, v) => typeof v === "bigint" ? v.toString() : v));
}
// Health check
app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});
// Create a new account
// app.post("/api/accounts", async (_req, res) => {
//   try {
//     const account = {
//       id: id(),
//       debits_pending: 0n,
//       debits_posted: 0n,
//       credits_pending: 0n,
//       credits_posted: 0n,
//       user_data_128: 0n,
//       user_data_64: 0n,
//       user_data_32: 0,
//       reserved: 0,
//       ledger: 1,
//       code: 1,
//       flags: AccountFlags.history | AccountFlags.debits_must_not_exceed_credits,
//       timestamp: 0n,
//     };
//     const errors = await client.createAccounts([account]);
//     if (errors.length > 0) {
//       return res.status(400).json({ errors: jsonifyBigInts(errors) });
//     }
//     res.json({
//       accountId: account.id.toString(),
//     });
//   } catch (err) {
//     console.error("Error creating account:", err);
//     res.status(500).json({ error: "Failed to create account" });
//   }
// });
// Get account info + simple balance
app.get("/api/accounts/:id", async (req, res) => {
    try {
        const accountId = BigInt(req.params.id);
        const accounts = await client.lookupAccounts([accountId]);
        if (!accounts || accounts.length === 0) {
            return res.status(404).json({ error: "Account not found" });
        }
        const account = accounts[0];
        const postedBalance = account.credits_posted - account.debits_posted;
        res.json(jsonifyBigInts({
            account,
            posted_balance: postedBalance,
        }));
    }
    catch (err) {
        console.error("Error fetching account:", err);
        res.status(500).json({ error: "Failed to fetch account" });
    }
});
// Get transaction history for an account
app.get("/api/accounts/:id/transfers", async (req, res) => {
    try {
        const accountId = BigInt(req.params.id);
        const filter = {
            account_id: accountId,
            user_data_128: 0n,
            user_data_64: 0n,
            user_data_32: 0,
            code: 0,
            timestamp_min: 0n,
            timestamp_max: 0n,
            limit: 50,
            flags: AccountFilterFlags.debits |
                AccountFilterFlags.credits |
                AccountFilterFlags.reversed,
        };
        const transfers = await client.getAccountTransfers(filter);
        res.json({ transfers: jsonifyBigInts(transfers) });
    }
    catch (err) {
        console.error("Error fetching transfers:", err);
        res.status(500).json({ error: "Failed to fetch transfers" });
    }
});
// Top up an account from a configured source (e.g. treasury)
app.post("/api/topup", async (req, res) => {
    try {
        const { creditAccountId, amount, debitAccountId } = req.body;
        if (!creditAccountId || amount == null) {
            return res
                .status(400)
                .json({ error: "creditAccountId and amount are required" });
        }
        const configuredDebit = debitAccountId ?? (await getOrCreateTreasuryAccountId());
        const transfer = {
            id: id(),
            debit_account_id: BigInt(configuredDebit),
            credit_account_id: BigInt(creditAccountId),
            amount: BigInt(amount),
            pending_id: 0n,
            user_data_128: 0n,
            user_data_64: 0n,
            user_data_32: 0,
            timeout: 0,
            ledger: 1,
            code: 1,
            flags: 0,
            timestamp: 0n,
        };
        const errors = await client.createTransfers([transfer]);
        if (errors.length > 0) {
            const err = errors[0];
            if (err.result === CreateTransferError.exceeds_credits) {
                return res.status(400).json({
                    error: "Insufficient balance",
                    code: "exceeds_credits",
                    message: "Your account does not have enough balance for this transfer.",
                });
            }
            return res.status(400).json({ errors: jsonifyBigInts(errors) });
        }
        res.json({ transferId: transfer.id.toString() });
    }
    catch (err) {
        console.error("Error topping up account:", err);
        res.status(500).json({ error: "Failed to top up account" });
    }
});
// Create a transfer between two accounts
app.post("/api/transfers", async (req, res) => {
    try {
        const { debitAccountId, creditAccountId, amount } = req.body;
        if (!debitAccountId || !creditAccountId || amount == null) {
            return res.status(400).json({
                error: "debitAccountId, creditAccountId and amount are required",
            });
        }
        const amountBigInt = BigInt(amount);
        if (amountBigInt <= 0n) {
            return res.status(400).json({
                error: "Amount must be greater than zero",
            });
        }
        // Enforce balance >= 0: debit account must have at least `amount` available
        const debitAccounts = await client.lookupAccounts([BigInt(debitAccountId)]);
        if (!debitAccounts || debitAccounts.length === 0) {
            return res.status(404).json({ error: "Debit account not found" });
        }
        const debitAccount = debitAccounts[0];
        const balance = debitAccount.credits_posted - debitAccount.debits_posted;
        if (balance < amountBigInt) {
            return res.status(400).json({
                error: "Insufficient balance",
                code: "exceeds_credits",
                message: "Your account does not have enough balance for this transfer.",
            });
        }
        const transfer = {
            id: id(),
            debit_account_id: BigInt(debitAccountId),
            credit_account_id: BigInt(creditAccountId),
            amount: amountBigInt,
            pending_id: 0n,
            user_data_128: 0n,
            user_data_64: 0n,
            user_data_32: 0,
            timeout: 0,
            ledger: 1,
            code: 1,
            flags: 0,
            timestamp: 0n,
        };
        const errors = await client.createTransfers([transfer]);
        if (errors.length > 0) {
            const err = errors[0];
            if (err.result === CreateTransferError.exceeds_credits) {
                return res.status(400).json({
                    error: "Insufficient balance",
                    code: "exceeds_credits",
                    message: "The debit account does not have enough balance for this transfer.",
                });
            }
            return res.status(400).json({ errors: jsonifyBigInts(errors) });
        }
        res.json({ transferId: transfer.id.toString() });
    }
    catch (err) {
        console.error("Error creating transfer:", err);
        res.status(500).json({ error: "Failed to create transfer" });
    }
});
app.listen(PORT, () => {
    console.log(`Backend server listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map