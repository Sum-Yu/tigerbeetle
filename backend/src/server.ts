import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  createClient,
  id,
  AccountFlags,
  AccountFilterFlags,
  CreateTransferError,
} from "tigerbeetle-node";
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

// TigerBeetle has no "currency" field — it uses ledgers. We map:
// Ledger 1 = SGD (Singapore), Ledger 2 = USD. Each account belongs to one ledger;
// transfers/topups must use the same ledger as the account.
const CURRENCY_LEDGER = { SGD: 1, USD: 2 } as const;

function currencyToLedger(currency: string): number {
  const c = (currency || "SGD").toUpperCase();
  if (c === "USD") return CURRENCY_LEDGER.USD;
  return CURRENCY_LEDGER.SGD;
}

// Treasury account IDs: ledger 1 (SGD) and ledger 2 (USD)
// SGD: 2143716050281588449624483694387216145.

let TREASURY_ACCOUNT_ID_SGD: string | null =
  process.env.TB_TREASURY_ACCOUNT_ID ?? "2143405532528893555931184785396120149";
let TREASURY_ACCOUNT_ID_USD: string | null =
  process.env.TB_TREASURY_ACCOUNT_ID_USD ?? null;

async function getOrCreateTreasuryAccountId(ledger: number): Promise<string> {
  const isSGD = ledger === 1;
  let existing = isSGD ? TREASURY_ACCOUNT_ID_SGD : TREASURY_ACCOUNT_ID_USD;

  if (existing) {
    const accounts = await client.lookupAccounts([BigInt(existing)]);
    if (accounts?.length > 0 && accounts[0].ledger === ledger) {
      return existing;
    }
    existing = null;
    if (isSGD) TREASURY_ACCOUNT_ID_SGD = null;
    else TREASURY_ACCOUNT_ID_USD = null;
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
    ledger,
    code: 1,
    flags: AccountFlags.history,
    timestamp: 0n,
  };

  const errors = await client.createAccounts([account]);
  if (errors.length > 0) {
    console.error("Failed to create treasury account:", errors);
    throw new Error("Failed to create treasury account");
  }

  const idStr = account.id.toString();
  if (isSGD) {
    TREASURY_ACCOUNT_ID_SGD = idStr;
  } else {
    TREASURY_ACCOUNT_ID_USD = idStr;
  }
  console.log(
    `Created treasury (${isSGD ? "SGD" : "USD"}) account with id=${idStr}.`,
  );
  return idStr;
}

function jsonifyBigInts<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_: unknown, v: unknown) =>
      typeof v === "bigint" ? v.toString() : v,
    ),
  ) as T;
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

// Top up an account from a configured source (e.g. treasury)
app.post("/api/topup", async (req, res) => {
  try {
    const { creditAccountId, amount, debitAccountId, currency } = req.body as {
      creditAccountId?: string;
      amount?: string | number;
      debitAccountId?: string;
      currency?: string;
    };

    if (!creditAccountId || amount == null) {
      return res
        .status(400)
        .json({ error: "creditAccountId and amount are required" });
    }

    const ledger = currencyToLedger(currency ?? "SGD");
    const creditAccounts = await client.lookupAccounts([
      BigInt(creditAccountId),
    ]);
    if (!creditAccounts?.length) {
      return res.status(404).json({ error: "Credit account not found" });
    }
    const creditLedger = creditAccounts[0].ledger;
    if (creditLedger !== ledger) {
      const accountCurrency = creditLedger === 2 ? "USD" : "SGD";
      const requestedCurrency = ledger === 2 ? "USD" : "SGD";
      return res.status(400).json({
        error: "Currency mismatch",
        message: `This account is in ${accountCurrency} (ledger ${creditLedger}). Use currency: "${accountCurrency}" to top up, not "${requestedCurrency}".`,
      });
    }

    const configuredDebit =
      debitAccountId ?? (await getOrCreateTreasuryAccountId(ledger));

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
      ledger,
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
          message:
            "Your account does not have enough balance for this transfer.",
        });
      }
      if (
        err.result ===
          CreateTransferError.transfer_must_have_the_same_ledger_as_accounts ||
        err.result === CreateTransferError.accounts_must_have_the_same_ledger
      ) {
        return res.status(400).json({
          error: "Currency mismatch",
          message:
            "Account is in a different currency (ledger). Use the same currency as the account (SGD = ledger 1, USD = ledger 2).",
        });
      }
      if (err.result === CreateTransferError.debit_account_not_found) {
        return res.status(500).json({
          error: "Treasury account missing",
          message:
            "SGD treasury account was not found in the ledger. Restart the backend to auto-create it, then try again.",
        });
      }
      if (err.result === CreateTransferError.credit_account_not_found) {
        return res.status(404).json({
          error: "Account not found",
          message: "The credit account does not exist in the ledger.",
        });
      }
      return res.status(400).json({
        error: "Transfer failed",
        message:
          "Transfer was rejected. Ensure both accounts use the same currency (SGD or USD) and the debit account has enough balance.",
        errors: jsonifyBigInts(errors),
      });
    }

    res.json({ transferId: transfer.id.toString() });
  } catch (err) {
    console.error("Error topping up account:", err);
    res.status(500).json({ error: "Failed to top up account" });
  }
});

// Create a transfer between two accounts
app.post("/api/transfers", async (req, res) => {
  try {
    const { debitAccountId, creditAccountId, amount, currency } = req.body as {
      debitAccountId?: string;
      creditAccountId?: string;
      amount?: string | number;
      currency?: string;
    };

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

    const ledger = currencyToLedger(currency ?? "SGD");

    // Enforce balance >= 0: debit account must have at least `amount` available
    const debitAccounts = await client.lookupAccounts([BigInt(debitAccountId)]);
    if (!debitAccounts || debitAccounts.length === 0) {
      return res.status(404).json({ error: "Debit account not found" });
    }
    const debitAccount = debitAccounts[0];
    if (debitAccount.ledger !== ledger) {
      return res.status(400).json({
        error:
          "Debit account is not in the selected currency (ledger). Use an account created for " +
          (ledger === 1 ? "SGD" : "USD") +
          ".",
      });
    }
    const creditAccounts = await client.lookupAccounts([
      BigInt(creditAccountId),
    ]);
    if (!creditAccounts || creditAccounts.length === 0) {
      return res.status(404).json({ error: "Credit account not found" });
    }
    if (creditAccounts[0].ledger !== ledger) {
      return res.status(400).json({
        error:
          "Credit account is not in the selected currency (ledger). Use an account created for " +
          (ledger === 1 ? "SGD" : "USD") +
          ".",
      });
    }
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
      ledger,
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
          message:
            "The debit account does not have enough balance for this transfer.",
        });
      }
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
