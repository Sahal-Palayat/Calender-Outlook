"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyJWT_1 = __importDefault(require("../middlewares/verifyJWT"));
const verifyRole_1 = __importDefault(require("../middlewares/verifyRole"));
const managerController_1 = require("../controllers/managerController");
const multer_1 = __importDefault(require("../middlewares/multer"));
const router = (0, express_1.Router)({ caseSensitive: true }).use(verifyJWT_1.default).use((0, verifyRole_1.default)("manager"));
router.route("/tasks").get(managerController_1.getTasks).post(managerController_1.addTask);
router.route("/tasks/:id").get(managerController_1.getDetails).put(managerController_1.updateTask).delete(managerController_1.deleteTask);
router.route("/employee").post(multer_1.default.single("profile"), managerController_1.addEmployee).get(managerController_1.getEmployees);
router.route("/employee/:id").delete(managerController_1.deleteEmployee);
router.route("/").get(managerController_1.verify);
exports.default = router;
