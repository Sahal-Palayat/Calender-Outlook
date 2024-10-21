import { RequestHandler, Router } from "express"
import VerifyJWT from "../middlewares/verifyJWT"
import VerifyRole from "../middlewares/verifyRole"
import { getDetails, getTasks, login,updateDetails, verify } from "../controllers/userController"
const router: Router = Router({ caseSensitive: true }).use(VerifyJWT).use(VerifyRole("employee"))

router.route("/tasks").get(getTasks as RequestHandler)
router.route("/tasks/:id").get(getDetails as RequestHandler).patch(updateDetails as RequestHandler)
router.route("/").get(verify as RequestHandler)

export default router;