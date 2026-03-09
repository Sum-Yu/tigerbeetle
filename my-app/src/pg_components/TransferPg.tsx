import "../App.css";

export type TransferPgProps = {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  loading: boolean;
  error: string | null;
  onChangeFromAccountId: (value: string) => void;
  onChangeToAccountId: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onTransfer: () => void | Promise<void>;
};

export default function TransferPg({
  fromAccountId,
  toAccountId,
  amount,
  loading,
  error,
  onChangeFromAccountId,
  onChangeToAccountId,
  onChangeAmount,
  onTransfer,
}: TransferPgProps) {
  return (
    <div className="tb-card">
      <h2 className="tb-card-title">Transfer (PgLedger)</h2>
      <p className="tb-card-description">
        Move funds from one account to another. Both accounts must use the same currency.
      </p>
      {error && (
        <div className="tb-alert tb-alert-error" role="alert">
          {error}
        </div>
      )}
      <div className="tb-form">
        <label className="tb-field">
          <span className="tb-field-label">From Account ID (Sender)</span>
          <input
            className="tb-input"
            type="text"
            value={fromAccountId}
            onChange={(e) => onChangeFromAccountId(e.target.value)}
            placeholder="e.g. pgla_..."
          />
        </label>
        <label className="tb-field">
          <span className="tb-field-label">To Account ID (Receiver)</span>
          <input
            className="tb-input"
            type="text"
            value={toAccountId}
            onChange={(e) => onChangeToAccountId(e.target.value)}
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
          onClick={onTransfer}
          disabled={
            loading ||
            !fromAccountId.trim() ||
            !toAccountId.trim() ||
            !amount ||
            Number(amount) <= 0
          }
        >
          {loading ? "Working..." : "Submit Transfer"}
        </button>
      </div>
    </div>
  );
}
