const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const PGLEDGER_BASE = `${API_BASE_URL}/pgledger`;

// Normalize API response: Postgres views return snake_case; we use camelCase in app
function toCamelCase<T extends Record<string, unknown>>(
  row: T,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out;
}

export type PgledgerAccount = {
  id: string;
  name: string;
  currency: string;
  balance: string;
  version?: number;
  allowNegativeBalance?: boolean;
  allowPositiveBalance?: boolean;
  metadata?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

export type PgledgerTransfer = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  createdAt?: string;
  eventAt?: string;
  metadata?: unknown;
};

export async function createAccountApi(body: {
  name: string;
  email: string;
  currency?: string;
  allowNegativeBalance?: boolean;
  allowPositiveBalance?: boolean;
}): Promise<PgledgerAccount> {
  const res = await fetch(`${PGLEDGER_BASE}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: body.name,
      email: body.email,
      currency: body.currency ?? "USD",
      allowNegativeBalance: body.allowNegativeBalance ?? true,
      allowPositiveBalance: body.allowPositiveBalance ?? true,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string }).error || "Failed to create account",
    );
  }
  const data = (await res.json()) as Record<string, unknown>;
  return toCamelCase(data) as unknown as PgledgerAccount;
}

export async function listAccountsApi(): Promise<{
  accounts: PgledgerAccount[];
}> {
  const res = await fetch(`${PGLEDGER_BASE}/accounts`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string }).error || "Failed to list accounts",
    );
  }
  const data = (await res.json()) as { accounts: Record<string, unknown>[] };
  return {
    accounts: (data.accounts || []).map(
      (a) => toCamelCase(a) as unknown as PgledgerAccount,
    ),
  };
}

export async function getAccountApi(id: string): Promise<PgledgerAccount> {
  const res = await fetch(
    `${PGLEDGER_BASE}/accounts/${encodeURIComponent(id)}`,
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) throw new Error("Account not found");
    throw new Error(
      (data as { error?: string }).error || "Failed to get account",
    );
  }
  const data = (await res.json()) as Record<string, unknown>;
  return toCamelCase(data) as unknown as PgledgerAccount;
}

export async function getAccountTransfersApi(
  accountId: string,
): Promise<{ transfers: PgledgerTransfer[] }> {
  const res = await fetch(
    `${PGLEDGER_BASE}/accounts/${encodeURIComponent(accountId)}/transfers`,
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string }).error || "Failed to get transfers",
    );
  }
  const data = (await res.json()) as { transfers: Record<string, unknown>[] };
  return {
    transfers: (data.transfers || []).map(
      (t) => toCamelCase(t) as unknown as PgledgerTransfer,
    ),
  };
}

export async function fetchAccountAndHistoryApi(accountId: string): Promise<{
  account: PgledgerAccount;
  transfers: PgledgerTransfer[];
}> {
  const [account, { transfers }] = await Promise.all([
    getAccountApi(accountId),
    getAccountTransfersApi(accountId),
  ]);
  return { account, transfers };
}

export async function createTransferApi(input: {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
}): Promise<PgledgerTransfer> {
  const res = await fetch(`${PGLEDGER_BASE}/transfers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string }).error || "Failed to create transfer",
    );
  }
  const data = (await res.json()) as Record<string, unknown>;
  return toCamelCase(data) as unknown as PgledgerTransfer;
}

export async function topUpAccountApi(input: {
  creditAccountId: string;
  amount: string;
}): Promise<PgledgerTransfer> {
  const res = await fetch(`${PGLEDGER_BASE}/topup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Failed to top up");
  }
  const data = (await res.json()) as Record<string, unknown>;
  return toCamelCase(data) as unknown as PgledgerTransfer;
}
