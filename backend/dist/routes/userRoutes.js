import { Router } from "express";
import createUser from "../controller/user/createUser.js";
const router = Router();
router.post("/", createUser);
export default router;
//# sourceMappingURL=userRoutes.js.map