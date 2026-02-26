import { useState } from "react";
import "./App.css";
import {
  createAccountApi,
  createTransferApi,
  fetchAccountAndHistoryApi,
  type AccountSummary,
  type Transfer,
} from "./api/tigerbeetle";
import CreateAcc from "./components/createAcc";

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

  // 2142322132939244820262595012401905400
  // 2142322155302171094276862091850845246

  async function createAccount() {
    setError(null);
    setLoading(true);
    try {
      const { accountId } = await createAccountApi();
      setCreatedAccountId(accountId);
      if (!debitAccountId) {
        setDebitAccountId(accountId);
      }
      if (!lookupAccountId) {
        setLookupAccountId(accountId);
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
      await createTransferApi({
        debitAccountId,
        creditAccountId,
        amount,
      });
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
      const { accountInfo: info, transfers: list } =
        await fetchAccountAndHistoryApi(accountId);
      setAccountInfo(info);
      setTransfers(list);
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
            <h1 className="tb-title">TigerBeetle </h1>
            <p className="tb-subtitle">
              Demo dashboard for accounts & transfers
            </p>
          </div>
        </div>
      </header>

      <main className="tb-main">
        {error && <div className="tb-alert tb-alert-error">{error}</div>}

        <section className="tb-grid">
          <CreateAcc
            createdAccountId={createdAccountId}
            loading={loading}
            onCreateAccount={createAccount}
          />

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
                Look up an account&apos;s current posted balance and recent
                transfers.
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
