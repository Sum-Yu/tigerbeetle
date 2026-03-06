import type { Request, Response } from "express";

import { db } from "../../db/index.js";
import { tbClient } from "../../lib/tigerbettle.js";

export default async function getUserList(req: Request, res: Response) {
  try {
    const users = await db.query.user.findMany();

    const accountIds = users
      .map((u) => u.tigerbeetleAccountId)
      .filter((id): id is string => id != null);

    const balanceByAccountId = new Map<string, number>();
    if (accountIds.length > 0) {
      try {
        const accounts = await tbClient.lookupAccounts(
          accountIds.map((id) => BigInt(id)),
        );
        for (const a of accounts) {
          const posted =
            a.credits_posted - a.debits_posted;
          balanceByAccountId.set(a.id.toString(), Number(posted));
        }
      } catch (tbErr) {
        console.error("TigerBeetle lookup in getUserList:", tbErr);
      }
    }

    const usersWithBalance = users.map((u) => ({
      ...u,
      balance: u.tigerbeetleAccountId
        ? balanceByAccountId.get(u.tigerbeetleAccountId) ?? 0
        : Number(u.balance ?? 0),
    }));

    return res.status(200).json({ users: usersWithBalance });
  } catch (err: unknown) {
    console.error("Error getting user list:", err);
    return res.status(500).json({ error: "Failed to get user list" });
  }
}
