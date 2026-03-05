import { user } from "../../db/schema/user.js";
import { tbClient, buildTbAccount } from "../../lib/tigerbettle.js";
import { db } from "../../db/index.js";
export default async function createUser(req, res) {
    try {
        const { email, name } = req.body;
        if (!email)
            return res.status(400).json({ error: "email is required" });
        const existing = await db.query.user.findFirst({
            where: (u, { eq }) => eq(u.email, email),
        });
        if (existing)
            return res.status(409).json({ error: "email already exists" });
        // 1) Create TigerBeetle account
        const account = buildTbAccount();
        const errors = await tbClient.createAccounts([account]);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        // 2) Insert user row with tigerbeetleAccountId
        // Use returning() so you can respond with inserted user
        const [created] = await db
            .insert(user)
            .values({
            email,
            name,
            tigerbeetleAccountId: account.id.toString(),
        })
            .returning();
        return res.status(201).json({
            user: created,
            tigerbeetleAccountId: account.id.toString(),
        });
    }
    catch (err) {
        console.error("Error creating user:", err);
        if (err?.code === "23505") {
            return res.status(409).json({ error: "email already exists" });
        }
        return res.status(500).json({ error: "Failed to create user" });
    }
}
//# sourceMappingURL=createUser.js.map