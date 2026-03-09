import "../App.css";
import type { PgledgerAccount, PgledgerTransfer } from "../api/pgledger";

export type ViewAccountPgProps = {
  lookupAccountId: string;
  account: PgledgerAccount | null;
  transfers: PgledgerTransfer[];
  loading: boolean;
  onChangeLookupAccountId: (value: string) => void;
  onLoad: () => void;
};

export default function ViewAccountPg({
  lookupAccountId,
  account,
  transfers,
  loading,
  onChangeLookupAccountId,
  onLoad,
}: ViewAccountPgProps) {
  return (
    <section className="tb-card tb-card-wide">
      <div className="tb-card-header-row">
        <div>
          <h2 className="tb-card-title">View Account (PgLedger)</h2>
          <p className="tb-card-description">
            Look up an account&apos;s balance and recent transfers by account ID.
          </p>
        </div>
        <div className="tb-lookup">
          <input
            className="tb-input"
            type="text"
            placeholder="Account ID (e.g. pgla_...)"
            value={lookupAccountId}
            onChange={(e) => onChangeLookupAccountId(e.target.value)}
          />
          <button
            className="tb-button tb-button-primary"
            onClick={onLoad}
            disabled={loading || !lookupAccountId.trim()}
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>
      </div>

      {account && (
        <div className="tb-account-summary">
          <div className="tb-account-summary-block">
            <span className="tb-label">Account ID</span>
            <code className="tb-mono">{account.id}</code>
          </div>
          <div className="tb-account-summary-block">
            <span className="tb-label">Name</span>
            <span>{account.name}</span>
          </div>
          <div className="tb-account-summary-block">
            <span className="tb-label">Currency</span>
            <span>{account.currency}</span>
          </div>
          <div className="tb-account-summary-block">
            <span className="tb-label">Balance</span>
            <span className="tb-balance">{account.balance}</span>
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
                <th>From</th>
                <th>To</th>
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
                    <code className="tb-mono">{t.fromAccountId}</code>
                  </td>
                  <td>
                    <code className="tb-mono">{t.toAccountId}</code>
                  </td>
                  <td>{t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {account && transfers.length === 0 && (
        <p className="tb-empty">No transfers for this account yet.</p>
      )}
    </section>
  );
}
