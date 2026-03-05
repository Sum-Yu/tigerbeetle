import { Router } from "express";
import createUser from "../controller/user/createUser.js";
import getUserList from "../controller/user/getUserList.js";
const router = Router();
router.post("/create-user", createUser);
router.get("/get-user-list", getUserList);
export default router;
//# sourceMappingURL=userRoutes.js.map