import "../App.css";
type CreateAccProps = {
  createdAccountId: string | null;
  loading: boolean;
  onCreateAccount: () => void | Promise<void>;
};

function CreateAcc({
  createdAccountId,
  loading,
  onCreateAccount,
}: CreateAccProps) {
  return (
    <div className="tb-card">
      <h2 className="tb-card-title">Create Account</h2>
      <p className="tb-card-description">
        Create a new TigerBeetle account with history tracking enabled.
      </p>
      <button
        className="tb-button tb-button-primary"
        onClick={onCreateAccount}
        disabled={loading}
      >
        {loading ? "Working..." : "Create New Account"}
      </button>
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
