import "../App.css";
type TransferAmountProps = {
  debitAccountId: string;
  creditAccountId: string;
  amount: string;
  loading: boolean;
  error: string | null;
  onChangeDebitAccountId: (value: string) => void;
  onChangeCreditAccountId: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onTransferAmount: () => void | Promise<void>;
};

function TransferAmount({
  debitAccountId,
  creditAccountId,
  amount,
  loading,
  error,
  onChangeDebitAccountId,
  onChangeCreditAccountId,
  onChangeAmount,
  onTransferAmount,
}: TransferAmountProps) {
  return (
    <div className="tb-card">
      <h2 className="tb-card-title">Create Transfer</h2>
      <p className="tb-card-description">
        Move funds between two accounts in a single transfer.
      </p>
      {error && (
        <div className="tb-alert tb-alert-error" role="alert">
          {error}
        </div>
      )}
      <div className="tb-form">
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
