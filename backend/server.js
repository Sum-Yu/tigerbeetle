const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const {
  createClient,
  id,
  AccountFlags,
  AccountFilterFlags,
} = require("tigerbeetle-node");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Configure TigerBeetle client
const client = createClient({
  cluster_id: BigInt(process.env.TB_CLUSTER_ID || 0),
  replica_addresses: [process.env.TB_ADDRESS || "3000"],
});

function jsonifyBigInts(value) {
  return JSON.parse(
    JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
  );
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Create a new account
app.post("/api/accounts", async (req, res) => {
  try {
    const account = {
      id: id(), // time-based TigerBeetle ID
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
      flags: AccountFlags.history, // keep history for balances
      timestamp: 0n,
    };

    const errors = await client.createAccounts([account]);
    if (errors.length > 0) {
      return res.status(400).json({ errors: jsonifyBigInts(errors) });
    }

    res.json({
      accountId: account.id.toString(),
    });
  } catch (err) {
    console.error("Error creating account:", err);
    res.status(500).json({ error: "Failed to create account" });
  }
});

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

    res.json(
      jsonifyBigInts({
        account,
        posted_balance: postedBalance,
      }),
    );
  } catch (err) {
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
      flags:
        AccountFilterFlags.debits |
        AccountFilterFlags.credits |
        AccountFilterFlags.reversed,
    };

    const transfers = await client.getAccountTransfers(filter);
    res.json({ transfers: jsonifyBigInts(transfers) });
  } catch (err) {
    console.error("Error fetching transfers:", err);
    res.status(500).json({ error: "Failed to fetch transfers" });
  }
});

// Create a transfer between two accounts
app.post("/api/transfers", async (req, res) => {
  try {
    const { debitAccountId, creditAccountId, amount } = req.body;

    if (!debitAccountId || !creditAccountId || !amount) {
      return res.status(400).json({
        error: "debitAccountId, creditAccountId and amount are required",
      });
    }

    const transfer = {
      id: id(),
      debit_account_id: BigInt(debitAccountId),
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
      return res.status(400).json({ errors: jsonifyBigInts(errors) });
    }

    res.json({ transferId: transfer.id.toString() });
  } catch (err) {
    console.error("Error creating transfer:", err);
    res.status(500).json({ error: "Failed to create transfer" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
