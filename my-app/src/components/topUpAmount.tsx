import "../App.css";

type TopUpCurrency = "SGD" | "USD";

type TopUpAmountProps = {
  accountId: string;
  amount: string;
  currency: TopUpCurrency;
  loading: boolean;
  onChangeAccountId: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onChangeCurrency: (value: TopUpCurrency) => void;
  onTopUp: () => void | Promise<void>;
  topUpError: string | null;
};

function TopUpAmount({
  accountId,
  amount,
  currency,
  loading,
  onChangeAccountId,
  onChangeAmount,
  onChangeCurrency,
  onTopUp,
  topUpError,
}: TopUpAmountProps) {
  return (
    <>
      <div className="tb-card">
        <h2 className="tb-card-title">Bank / Treasury Account</h2>
        <p className="tb-card-description">
          SGD ledger 1 / USD ledger 2 — treasury is created per currency.
        </p>
      </div>
      <div className="tb-card">
        <h2 className="tb-card-title">Top Up Account</h2>
        <p className="tb-card-description">
          Add funds to an account from the configured funding account.
        </p>
        <div className="tb-form">
          <label className="tb-field">
            <span className="tb-field-label">Currency</span>
            <select
              className="tb-input"
              value={currency}
              onChange={(e) =>
                onChangeCurrency(e.target.value as TopUpCurrency)
              }
            >
              <option value="SGD">SGD (Singapore)</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <label className="tb-field">
            <span className="tb-field-label">Account ID</span>
            <input
              className="tb-input"
              type="text"
              value={accountId}
              onChange={(e) => onChangeAccountId(e.target.value)}
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
            onClick={onTopUp}
            disabled={loading}
          >
            {loading ? "Working..." : "Add Amount"}
          </button>
          {topUpError && (
            <p className="tb-alert tb-alert-error">{topUpError}</p>
          )}
        </div>
      </div>
    </>
  );
}

export default TopUpAmount;
