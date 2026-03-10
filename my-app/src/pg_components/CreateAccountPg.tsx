import "../App.css";
import { useState } from "react";

export type CreateAccountPgProps = {
  createdAccountId: string | null;
  loading: boolean;
  onCreateAccount: (name: string, currency?: string) => void | Promise<void>;
};

export default function CreateAccountPg({
  createdAccountId,
  loading,
  onCreateAccount,
}: CreateAccountPgProps) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");

  return (
    <div className="tb-card">
      <h2 className="tb-card-title">Create Account (PgLedger)</h2>
      <p className="tb-card-description">
        Create a new ledger account with name and currency. Balance starts at 0.
      </p>
      <div className="tb-form">
        <input
          className="tb-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Account name"
          autoComplete="off"
        />
        <input
          className="tb-input"
          type="text"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          placeholder="Currency (e.g. USD)"
          autoComplete="off"
        />
        <button
          className="tb-button tb-button-primary"
          onClick={() =>
            onCreateAccount(name.trim(), currency.trim() || undefined)
          }
          disabled={loading || !name.trim()}
        >
          {loading ? "Working..." : "Create Account"}
        </button>
      </div>
      {createdAccountId && (
        <div className="tb-chip">
          <span className="tb-chip-label">New account ID</span>
          <code className="tb-chip-value">{createdAccountId}</code>
        </div>
      )}
    </div>
  );
}
