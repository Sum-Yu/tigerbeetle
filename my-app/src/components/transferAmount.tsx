import "../App.css";

export type TransferCurrency = "SGD" | "USD";

type TransferAmountProps = {
  debitAccountId: string;
  creditAccountId: string;
  amount: string;
  currency: TransferCurrency;
  loading: boolean;
  error: string | null;
  onChangeDebitAccountId: (value: string) => void;
  onChangeCreditAccountId: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onChangeCurrency: (value: TransferCurrency) => void;
  onTransferAmount: () => void | Promise<void>;
};

function TransferAmount({
  debitAccountId,
  creditAccountId,
  amount,
  currency,
  loading,
  error,
  onChangeDebitAccountId,
  onChangeCreditAccountId,
  onChangeAmount,
  onChangeCurrency,
  onTransferAmount,
}: TransferAmountProps) {
  return (
    <div className="tb-card">
      <h2 className="tb-card-title">Create Transfer (Same Currency)</h2>
      <p className="tb-card-description">
        Move funds between two accounts in a single transfer. Ledger 1 = SGD
        (Singapore), Ledger 2 = USD.
      </p>
      {error && (
        <div className="tb-alert tb-alert-error" role="alert">
          {error}
        </div>
      )}
      <div className="tb-form">
        <label className="tb-field">
          <span className="tb-field-label">Currency</span>
          <select
            className="tb-input"
            value={currency}
            onChange={(e) =>
              onChangeCurrency(e.target.value as TransferCurrency)
            }
          >
            <option value="SGD">SGD (Singapore)</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label className="tb-field">
          <span className="tb-field-label">Debit Account ID (Sender)</span>
          <input
            className="tb-input"
            type="text"
            value={debitAccountId}
            onChange={(e) => onChangeDebitAccountId(e.target.value)}
          />
        </label>
        <label className="tb-field">
          <span className="tb-field-label">Credit Account ID (Receiver)</span>
          <input
            className="tb-input"
            type="text"
            value={creditAccountId}
            onChange={(e) => onChangeCreditAccountId(e.target.value)}
          />
        </label>
        <label className="tb-field">
          <span className="tb-field-label">Amount</span>
          <input
            className="tb-input"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => onChangeAmount(e.target.value)}
          />
        </label>
        <button
          className="tb-button tb-button-secondary"
          onClick={onTransferAmount}
          disabled={loading}
        >
          {loading ? "Working..." : "Submit Transfer"}
        </button>
      </div>
    </div>
  );
}

export default TransferAmount;
