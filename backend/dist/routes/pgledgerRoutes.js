import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { pgledgerAccounts, pgledgerTransfers } from "../db/schema/index.js";
import { eq, or, desc } from "drizzle-orm";
const router = Router();
// In-memory cache for treasury account ID (or set PGLEDGER_TREASURY_ACCOUNT_ID in env)
let treasuryAccountId = process.env.PGLEDGER_TREASURY_ACCOUNT_ID ?? null;
function getRows(result) {
    const r = result;
    return Array.isArray(r?.rows) ? r.rows : [];
}
async function getOrCreateTreasuryAccountId() {
    if (treasuryAccountId)
        return treasuryAccountId;
    const result = await db.execute(sql `SELECT * FROM pgledger_create_account('Treasury', 'USD', true, true, null)`);
    const rows = getRows(result);
    const row = rows[0];
    const id = row && typeof row.id === "string" ? row.id : null;
    if (!id) {
        throw new Error("Failed to create or get treasury account");
    }
    treasuryAccountId = id;
    return id;
}
// Create account (pgledger)
router.post("/accounts", async (req, res) => {
    try {
        const { name, currency = "USD", allowNegativeBalance = true, allowPositiveBalance = true, metadata, } = req.body;
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ error: "name is required" });
        }
        const result = await db.execute(sql `SELECT * FROM pgledger_create_account(${name.trim()}, ${currency}, ${allowNegativeBalance}, ${allowPositiveBalance}, ${metadata ?? null})`);
        const rows = getRows(result);
        const account = rows[0];
        if (!account) {
            return res.status(500).json({ error: "Failed to create account" });
        }
        return res.status(201).json(account);
    }
    catch (err) {
        console.error("pgledger create account error:", err);
        const message = err instanceof Error ? err.message : "Failed to create account";
        return res.status(500).json({ error: message });
    }
});
// List accounts (pgledger)
router.get("/accounts", async (_req, res) => {
    try {
        const accounts = await db.select().from(pgledgerAccounts);
        return res.json({ accounts });
    }
    catch (err) {
        console.error("pgledger list accounts error:", err);
        return res.status(500).json({ error: "Failed to list accounts" });
    }
});
// Get single account (pgledger)
router.get("/accounts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [account] = await db
            .select()
            .from(pgledgerAccounts)
            .where(eq(pgledgerAccounts.id, id));
        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }
        return res.json(account);
    }
    catch (err) {
        console.error("pgledger get account error:", err);
        return res.status(500).json({ error: "Failed to get account" });
    }
});
// Get transfers for an account (pgledger)
router.get("/accounts/:id/transfers", async (req, res) => {
    try {
        const { id } = req.params;
        const transfers = await db
            .select()
            .from(pgledgerTransfers)
            .where(or(eq(pgledgerTransfers.fromAccountId, id), eq(pgledgerTransfers.toAccountId, id)))
            .orderBy(desc(pgledgerTransfers.createdAt));
        return res.json({ transfers });
    }
    catch (err) {
        console.error("pgledger get transfers error:", err);
        return res.status(500).json({ error: "Failed to get transfers" });
    }
});
// Create transfer (pgledger)
router.post("/transfers", async (req, res) => {
    try {
        const { fromAccountId, toAccountId, amount } = req.body;
        if (!fromAccountId || !toAccountId || amount == null) {
            return res.status(400).json({
                error: "fromAccountId, toAccountId and amount are required",
            });
        }
        const amountNum = typeof amount === "string" ? amount : String(amount);
        if (Number(amountNum) <= 0) {
            return res.status(400).json({ error: "Amount must be greater than zero" });
        }
        const result = await db.execute(sql `SELECT * FROM pgledger_create_transfer(${fromAccountId}, ${toAccountId}, ${amountNum}::numeric, null, null)`);
        const rows = getRows(result);
        const transfer = rows[0];
        if (!transfer) {
            return res.status(500).json({ error: "Failed to create transfer" });
        }
        return res.status(201).json(transfer);
    }
    catch (err) {
        console.error("pgledger create transfer error:", err);
        const message = err instanceof Error ? err.message : "Failed to create transfer";
        return res.status(400).json({ error: message });
    }
});
// Top up (transfer from treasury to account)
router.post("/topup", async (req, res) => {
    try {
        const { creditAccountId, amount } = req.body;
        if (!creditAccountId || amount == null) {
            return res
                .status(400)
                .json({ error: "creditAccountId and amount are required" });
        }
        const amountNum = typeof amount === "string" ? amount : String(amount);
        if (Number(amountNum) <= 0) {
            return res.status(400).json({ error: "Amount must be greater than zero" });
        }
        const debitAccountId = await getOrCreateTreasuryAccountId();
        const result = await db.execute(sql `SELECT * FROM pgledger_create_transfer(${debitAccountId}, ${creditAccountId}, ${amountNum}::numeric, null, null)`);
        const rows = getRows(result);
        const transfer = rows[0];
        if (!transfer) {
            return res.status(500).json({ error: "Failed to top up" });
        }
        return res.status(201).json(transfer);
    }
    catch (err) {
        console.error("pgledger topup error:", err);
        const message = err instanceof Error ? err.message : "Failed to top up";
        return res.status(400).json({ error: message });
    }
});
export default router;
//# sourceMappingURL=pgledgerRoutes.js.map