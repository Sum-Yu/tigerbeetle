import { useEffect, useState } from "react";
import { listAccountsApi, type PgledgerAccount } from "../api/pgledger";

export default function AccountListPg() {
  const [accounts, setAccounts] = useState<PgledgerAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { accounts: list } = await listAccountsApi();
      setAccounts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="tb-card w-full">
      <h2 className="tb-card-title">PgLedger Accounts</h2>
      <p className="tb-card-description">All ledger accounts. Use an ID for top-up, transfer, or view.</p>
      {loading && <p>Loading accounts…</p>}
      {error && <p style={{ color: "var(--color-error, #c00)" }}>{error}</p>}
      <div className="tb-table-wrapper">
        <table className="tb-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Currency</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id}>
                <td>
                  <code className="tb-mono">{acc.id}</code>
                </td>
                <td>{acc.name}</td>
                <td>{acc.currency}</td>
                <td>{acc.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && !error && accounts.length === 0 && (
        <p className="tb-empty">No accounts yet. Create one above.</p>
      )}
    </div>
  );
}
