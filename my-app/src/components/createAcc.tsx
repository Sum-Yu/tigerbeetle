import "../App.css";
import { useState } from "react";

type CreateAccProps = {
  createdAccountId: string | null;
  loading: boolean;
  onCreateAccount: (email: string, name?: string) => void | Promise<void>;
};

function CreateAcc({
  createdAccountId,
  loading,
  onCreateAccount,
}: CreateAccProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="tb-card">
      <h2 className="tb-card-title">Create Account</h2>
      <p className="tb-card-description">
        Create a new TigerBeetle account with history tracking enabled.
      </p>
      <div className="tb-form">
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
          onClick={() => onCreateAccount(email, name || undefined)}
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
