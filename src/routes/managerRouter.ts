import { RequestHandler, Router } from "express"
import VerifyJWT from "../middlewares/verifyJWT"
import VerifyRole from "../middlewares/verifyRole"
import { getDetails, getTasks, updateTask, deleteEmployee, deleteTask, addEmployee, addTask, verify, getEmployees } from "../controllers/managerController"
import upload from '../middlewares/multer';
const router: Router = Router({ caseSensitive: true }).use(VerifyJWT).use(VerifyRole("manager"))

router.route("/tasks").get(getTasks as RequestHandler).post(addTask as RequestHandler)
router.route("/tasks/:id").get(getDetails as RequestHandler).put(updateTask as RequestHandler).delete(deleteTask as RequestHandler)
router.route("/employee").post(upload.single("profile"),addEmployee as RequestHandler).get(getEmployees as RequestHandler)
router.route("/employee/:id").delete(deleteEmployee as RequestHandler)
router.route("/").get(verify as RequestHandler)


export default router;