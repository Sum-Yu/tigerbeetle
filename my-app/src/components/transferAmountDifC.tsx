import "../App.css";

export type FxCurrency = "SGD" | "USD";

type TransferAmountDifCProps = {
  debitAccountId: string;
  creditAccountId: string;
  amount: string;
  loading: boolean;
  error: string | null;
  lastRemark: string | null;
  onChangeDebitAccountId: (value: string) => void;
  onChangeCreditAccountId: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onTransferFx: () => void | Promise<void>;
};

function TransferAmountDifC({
  debitAccountId,
  creditAccountId,
  amount,
  loading,
  error,
  lastRemark,
  onChangeDebitAccountId,
  onChangeCreditAccountId,
  onChangeAmount,
  onTransferFx,
}: TransferAmountDifCProps) {
  return (
    <div className="tb-card">
      <h2 className="tb-card-title">
        Create Transfer (Different Currency / FX)
      </h2>
      <p className="tb-card-description">
        Convert automatically using fixed rates: SGD→USD = 0.78, USD→SGD = 1.28.
      </p>
      <p className="tb-card-description">
        The backend auto-detects each account&apos;s currency (ledger) and
        creates 2 TigerBeetle transfers (one per ledger), storing the FX rate
        metadata in the transfer&apos;s user_data fields.
      </p>
      {error && (
        <div className="tb-alert tb-alert-error" role="alert">
          {error}
        </div>
      )}
      {lastRemark && !error && (
        <div className="tb-alert" role="status">
          {lastRemark}
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
          <span className="tb-field-label">Amount (in From Currency)</span>
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
          onClick={onTransferFx}
          disabled={loading}
        >
          {loading ? "Working..." : "Submit FX Transfer"}
        </button>
      </div>
    </div>
  );
}

export default TransferAmountDifC;
