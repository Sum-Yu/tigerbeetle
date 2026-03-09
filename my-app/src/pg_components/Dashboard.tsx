import { useState } from "react";
import "../App.css";
import {
  createAccountApi,
  createTransferApi,
  fetchAccountAndHistoryApi,
  topUpAccountApi,
  type PgledgerAccount,
  type PgledgerTransfer,
} from "../api/pgledger";
import CreateAccountPg from "./CreateAccountPg";
import TopUpPg from "./TopUpPg";
import TransferPg from "./TransferPg";
import ViewAccountPg from "./ViewAccountPg";
import AccountListPg from "./AccountListPg";

export default function Dashboard() {
  const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("0");

  const [topUpAccountId, setTopUpAccountId] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("0");

  const [lookupAccountId, setLookupAccountId] = useState("");
  const [account, setAccount] = useState<PgledgerAccount | null>(null);
  const [transfers, setTransfers] = useState<PgledgerTransfer[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  async function createAccount(
    name: string,
    currency?: string,
    email?: string,
  ) {
    setError(null);
    setLoading(true);
    try {
      const created = await createAccountApi({ name, email, currency });
      setCreatedAccountId(created.id);
      if (!fromAccountId) setFromAccountId(created.id);
      if (!lookupAccountId) setLookupAccountId(created.id);
      if (!topUpAccountId) setTopUpAccountId(created.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function createTransfer() {
    setError(null);
    setTransferError(null);
    setLoading(true);
    try {
      await createTransferApi({
        fromAccountId,
        toAccountId,
        amount,
      });
      setTransferError(null);
      if (lookupAccountId) {
        void fetchAccountAndHistory(lookupAccountId);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setTransferError(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function topUpAccount() {
    setError(null);
    setLoading(true);
    try {
      await topUpAccountApi({
        creditAccountId: topUpAccountId,
        amount: topUpAmount,
      });
      if (lookupAccountId === topUpAccountId && topUpAccountId) {
        void fetchAccountAndHistory(topUpAccountId);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAccountAndHistory(accountId: string) {
    setError(null);
    setLoading(true);
    try {
      const { account: info, transfers: list } =
        await fetchAccountAndHistoryApi(accountId);
      setAccount(info);
      setTransfers(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setAccount(null);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="tb-header">
        <div className="tb-header-brand">
          <span className="tb-logo-dot" />
          <div>
            <h1 className="tb-title">PgLedger</h1>
            <p className="tb-subtitle">
              Demo dashboard — create account, top up, transfer, view account
            </p>
          </div>
        </div>
      </header>

      <main className="tb-main">
        {error && <div className="tb-alert tb-alert-error">{error}</div>}

        <h2 className="text-2xl font-bold ml-2">1. Create Account</h2>
        <CreateAccountPg
          createdAccountId={createdAccountId}
          loading={loading}
          onCreateAccount={createAccount}
        />

        <AccountListPg />

        <h2 className="text-2xl font-bold ml-2">2. Top Up Account</h2>
        <TopUpPg
          accountId={topUpAccountId}
          amount={topUpAmount}
          loading={loading}
          onChangeAccountId={setTopUpAccountId}
          onChangeAmount={setTopUpAmount}
          onTopUp={topUpAccount}
        />

        <h2 className="text-2xl font-bold ml-2">3. Transfer</h2>
        <TransferPg
          fromAccountId={fromAccountId}
          toAccountId={toAccountId}
          amount={amount}
          loading={loading}
          error={transferError}
          onChangeFromAccountId={setFromAccountId}
          onChangeToAccountId={setToAccountId}
          onChangeAmount={setAmount}
          onTransfer={createTransfer}
        />

        <h2 className="text-2xl font-bold ml-2">4. View Account</h2>
        <ViewAccountPg
          lookupAccountId={lookupAccountId}
          account={account}
          transfers={transfers}
          loading={loading}
          onChangeLookupAccountId={setLookupAccountId}
          onLoad={() =>
            lookupAccountId.trim() &&
            fetchAccountAndHistory(lookupAccountId.trim())
          }
        />
      </main>
    </>
  );
}
