import { db } from "../../db/index.js";
export default async function getUserList(req, res) {
    try {
        const users = await db.query.user.findMany();
        return res.status(200).json({ users });
    }
    catch (err) {
        console.error("Error getting user list:", err);
        return res.status(500).json({ error: "Failed to get user list" });
    }
}
//# sourceMappingURL=getUserList.js.map