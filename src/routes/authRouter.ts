import { RequestHandler, Router } from "express"
import { login as EmployeeLogin } from "../controllers/userController"
import { login as ManagerLogin, signup, verifyOtp } from "../controllers/managerController"
import upload from "../middlewares/multer"
const router: Router = Router({ caseSensitive: true })


router.route("/employee/login").post(EmployeeLogin as RequestHandler);
router.route("/manager/login").post(ManagerLogin as RequestHandler);
router.route("/manager/register").post(upload.single("profile"), signup as RequestHandler);
router.route("/manager/otp/:id").post(verifyOtp as RequestHandler);

export default router; 