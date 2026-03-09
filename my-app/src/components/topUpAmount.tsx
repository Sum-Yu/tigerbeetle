import "../App.css";

type TopUpAmountProps = {
  accountId: string;
  amount: string;
  loading: boolean;
  onChangeAccountId: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onTopUp: () => void | Promise<void>;
};

function TopUpAmount({
  accountId,
  amount,
  loading,
  onChangeAccountId,
  onChangeAmount,
  onTopUp,
}: TopUpAmountProps) {
  return (
    <>
      <div className="tb-card">
        <h2 className="tb-card-title">Bank / Treasury Account</h2>
        <p className="tb-card-description">
          Current Treasury Account ID : 2143405532528893555931184785396120149
        </p>
      </div>
      <div className="tb-card">
        <h2 className="tb-card-title">Top Up Account</h2>
        <p className="tb-card-description">
          Add funds to an account from the configured funding account.
        </p>
        <div className="tb-form">
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
        </div>
      </div>
    </>
  );
}

export default TopUpAmount;
