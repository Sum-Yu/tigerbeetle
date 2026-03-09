import "../App.css";

export type TopUpPgProps = {
  accountId: string;
  amount: string;
  loading: boolean;
  onChangeAccountId: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onTopUp: () => void | Promise<void>;
};

export default function TopUpPg({
  accountId,
  amount,
  loading,
  onChangeAccountId,
  onChangeAmount,
  onTopUp,
}: TopUpPgProps) {
  return (
    <div className="tb-card">
      <h2 className="tb-card-title">Top Up Account (PgLedger)</h2>
      <p className="tb-card-description">
        Add funds to an account from the Treasury. Enter the account ID and amount.
      </p>
      <div className="tb-form">
        <label className="tb-field">
          <span className="tb-field-label">Account ID</span>
          <input
            className="tb-input"
            type="text"
            value={accountId}
            onChange={(e) => onChangeAccountId(e.target.value)}
            placeholder="e.g. pgla_..."
          />
        </label>
        <label className="tb-field">
          <span className="tb-field-label">Amount</span>
          <input
            className="tb-input"
            type="number"
            min={0}
            step="any"
            value={amount}
            onChange={(e) => onChangeAmount(e.target.value)}
          />
        </label>
        <button
          className="tb-button tb-button-secondary"
          onClick={onTopUp}
          disabled={loading || !accountId.trim() || !amount || Number(amount) <= 0}
        >
          {loading ? "Working..." : "Add Amount"}
        </button>
      </div>
    </div>
  );
}
