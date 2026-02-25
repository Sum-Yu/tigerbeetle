import { useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:4000/api";

type AccountSummary = {
  account: {
    id: string;
    debits_posted: string;
    credits_posted: string;
  };
  posted_balance: string;
};

type Transfer = {
  id: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: string;
  timestamp: string;
};

function App() {
  const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);
  const [debitAccountId, setDebitAccountId] = useState("");
  const [creditAccountId, setCreditAccountId] = useState("");
  const [amount, setAmount] = useState("0");

  const [lookupAccountId, setLookupAccountId] = useState("");
  const [accountInfo, setAccountInfo] = useState<AccountSummary | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createAccount() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create account");
      }
      const data: { accountId: string } = await res.json();
      setCreatedAccountId(data.accountId);
      // default debit account to new account if empty
      if (!debitAccountId) {
        setDebitAccountId(data.accountId);
      }
      if (!lookupAccountId) {
        setLookupAccountId(data.accountId);
      }
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function createTransfer() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/transfers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debitAccountId,
          creditAccountId,
          amount,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create transfer");
      }
      await res.json();
      // Refresh account + transfers for the debit account if it matches lookup
      if (lookupAccountId) {
        void fetchAccountAndHistory(lookupAccountId);
      }
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAccountAndHistory(accountId: string) {
    setError(null);
    setLoading(true);
    try {
      const [accountRes, transfersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/accounts/${accountId}`),
        fetch(`${API_BASE_URL}/accounts/${accountId}/transfers`),
      ]);

      if (!accountRes.ok) {
        const body = await accountRes.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load account");
      }
      if (!transfersRes.ok) {
        const body = await transfersRes.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load transfers");
      }

      const accountData = (await accountRes.json()) as AccountSummary;
      const transfersData = (await transfersRes.json()) as {
        transfers: Transfer[];
      };

      setAccountInfo(accountData);
      setTransfers(transfersData.transfers ?? []);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
      setAccountInfo(null);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tb-root">
      <header className="tb-header">
        <div className="tb-header-brand">
          <span className="tb-logo-dot" />
          <div>
            <h1 className="tb-title">TigerBeetle Ledger</h1>
            <p className="tb-subtitle">Demo dashboard for accounts & transfers</p>
          </div>
        </div>
        <div className="tb-header-pill">Correct &amp; Fast</div>
      </header>

      <main className="tb-main">
        {error && <div className="tb-alert tb-alert-error">{error}</div>}

        <section className="tb-grid">
          <div className="tb-card">
            <h2 className="tb-card-title">Create Account</h2>
            <p className="tb-card-description">
              Create a new TigerBeetle account with history tracking enabled.
            </p>
            <button
              className="tb-button tb-button-primary"
              onClick={createAccount}
              disabled={loading}
            >
              {loading ? "Working..." : "Create New Account"}
            </button>
            {createdAccountId && (
              <div className="tb-chip">
                <span className="tb-chip-label">New account ID</span>
                <code className="tb-chip-value">{createdAccountId}</code>
              </div>
            )}
          </div>

          <div className="tb-card">
            <h2 className="tb-card-title">Create Transfer</h2>
            <p className="tb-card-description">
              Move funds between two accounts in a single transfer.
            </p>
            <div className="tb-form">
              <label className="tb-field">
                <span className="tb-field-label">Debit Account ID</span>
                <input
                  className="tb-input"
                  type="text"
                  value={debitAccountId}
                  onChange={(e) => setDebitAccountId(e.target.value)}
                />
              </label>
              <label className="tb-field">
                <span className="tb-field-label">Credit Account ID</span>
                <input
                  className="tb-input"
                  type="text"
                  value={creditAccountId}
                  onChange={(e) => setCreditAccountId(e.target.value)}
                />
              </label>
              <label className="tb-field">
                <span className="tb-field-label">Amount</span>
                <input
                  className="tb-input"
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <button
                className="tb-button tb-button-secondary"
                onClick={createTransfer}
                disabled={loading}
              >
                {loading ? "Working..." : "Submit Transfer"}
              </button>
            </div>
          </div>
        </section>

        <section className="tb-card tb-card-wide">
          <div className="tb-card-header-row">
            <div>
              <h2 className="tb-card-title">Account Overview</h2>
              <p className="tb-card-description">
                Look up an account&apos;s current posted balance and recent transfers.
              </p>
            </div>
            <div className="tb-lookup">
              <input
                className="tb-input"
                type="text"
                placeholder="Paste account ID to inspect"
                value={lookupAccountId}
                onChange={(e) => setLookupAccountId(e.target.value)}
              />
              <button
                className="tb-button tb-button-primary"
                onClick={() =>
                  lookupAccountId && fetchAccountAndHistory(lookupAccountId)
                }
                disabled={loading || !lookupAccountId}
              >
                {loading ? "Loading..." : "Load"}
              </button>
            </div>
          </div>

          {accountInfo && (
            <div className="tb-account-summary">
              <div className="tb-account-summary-block">
                <span className="tb-label">Account ID</span>
                <code className="tb-mono">{accountInfo.account.id}</code>
              </div>
              <div className="tb-account-summary-block">
                <span className="tb-label">Posted Balance</span>
                <span className="tb-balance">
                  {accountInfo.posted_balance.toString()}
                </span>
              </div>
            </div>
          )}

          {transfers.length > 0 && (
            <div className="tb-table-wrapper">
              <h3 className="tb-table-title">Recent Transfers</h3>
              <table className="tb-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <code className="tb-mono">{t.id}</code>
                      </td>
                      <td>
                        <code className="tb-mono">{t.debit_account_id}</code>
                      </td>
                      <td>
                        <code className="tb-mono">{t.credit_account_id}</code>
                      </td>
                      <td>{t.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {accountInfo && transfers.length === 0 && (
            <p className="tb-empty">No transfers found for this account yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
