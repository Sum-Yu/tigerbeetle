export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export type AccountSummary = {
  account: {
    id: string;
    debits_posted: string;
    credits_posted: string;
  };
  posted_balance: string;
};

export type Transfer = {
  id: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: string;
  timestamp: string;
};

export async function createAccountApi(): Promise<{ accountId: string }> {
  const res = await fetch(`${API_BASE_URL}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to create account");
  }

  return (await res.json()) as { accountId: string };
}

export async function createTransferApi(input: {
  debitAccountId: string;
  creditAccountId: string;
  amount: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/transfers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to create transfer");
  }

  // Ignore body; we only care that it succeeded.
  await res.json().catch(() => undefined);
}

export async function topUpAccountApi(input: {
  creditAccountId: string;
  amount: string;
  debitAccountId?: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/topup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to top up account");
  }

  await res.json().catch(() => undefined);
}

export async function fetchAccountAndHistoryApi(accountId: string): Promise<{
  accountInfo: AccountSummary;
  transfers: Transfer[];
}> {
  const [accountRes, transfersRes] = await Promise.all([
    fetch(`${API_BASE_URL}/accounts/${accountId}`),
    fetch(`${API_BASE_URL}/accounts/${accountId}/transfers`),
  ]);

  if (!accountRes.ok) {
    const body = await accountRes.json().catch(() => ({}));
    throw new Error(body.error || "Failed to load account");
  }
  if (!transfersRes.ok) {
    const body = await transfersRes.json().catch(() => ({}));
    throw new Error(body.error || "Failed to load transfers");
  }

  const accountInfo = (await accountRes.json()) as AccountSummary;
  const transfersData = (await transfersRes.json()) as {
    transfers: Transfer[];
  };

  return {
    accountInfo,
    transfers: transfersData.transfers ?? [],
  };
}
