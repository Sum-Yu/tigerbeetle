import "../App.css";
import { useState } from "react";

export type CreateAccountCurrency = "SGD" | "USD";

type CreateAccProps = {
  createdAccountId: string | null;
  loading: boolean;
  onCreateAccount: (
    email: string,
    name?: string,
    currency?: CreateAccountCurrency
  ) => void | Promise<void>;
};

function CreateAcc({
  createdAccountId,
  loading,
  onCreateAccount,
}: CreateAccProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<CreateAccountCurrency>("SGD");

  return (
    <div className="tb-card">
      <h2 className="tb-card-title">Create Account</h2>
      <p className="tb-card-description">
        Create a new TigerBeetle account. SGD = ledger 1, USD = ledger 2.
      </p>
      <div className="tb-form">
        <label className="tb-field">
          <span className="tb-field-label">Currency</span>
          <select
            className="tb-input"
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value as CreateAccountCurrency)
            }
          >
            <option value="SGD">SGD (Singapore)</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <input
          className="tb-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
        />
        <input
          className="tb-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          autoComplete="name"
        />
        <button
          className="tb-button tb-button-primary"
          onClick={() =>
            onCreateAccount(email, name || undefined, currency)
          }
          disabled={loading || !email.trim()}
        >
          {loading ? "Working..." : "Create New Account"}
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

export default CreateAcc;
