import { RequestHandler, Router } from "express"
import VerifyJWT from "../middlewares/verifyJWT"
import VerifyRole from "../middlewares/verifyRole"
import { login as EmployeeLogin } from "../controllers/userController"
import { login as ManagerLogin, signup, verifyOtp } from "../controllers/managerController"
const router: Router = Router({ caseSensitive: true }).use(VerifyJWT).use(VerifyRole("employee"))


router.route("/employee/login").post(EmployeeLogin as RequestHandler);
router.route("/manager/login").post(ManagerLogin as RequestHandler);
router.route("/manager/register").post(signup as RequestHandler);
router.route("/manager/otp/:id").post(verifyOtp as RequestHandler);

export default router; 