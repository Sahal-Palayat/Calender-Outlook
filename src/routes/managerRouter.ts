import { RequestHandler, Router } from "express"
import VerifyJWT from "../middlewares/verifyJWT"
import VerifyRole from "../middlewares/verifyRole"
import { getDetails, getTasks, updateTask, deleteEmployee, deleteTask, addEmployee, addTask, verify } from "../controllers/managerController"
const router: Router = Router({ caseSensitive: true }).use(VerifyJWT).use(VerifyRole("manager"))

router.route("/tasks").get(getTasks as RequestHandler)
router.route("/tasks/:id").get(getDetails as RequestHandler).put(updateTask as RequestHandler).post(addTask as RequestHandler).delete(deleteTask as RequestHandler)
router.route("/employee").post(addEmployee as RequestHandler)
router.route("/employee/:id").delete(deleteEmployee as RequestHandler)
router.route("/").get(verify as RequestHandler)


export default router;