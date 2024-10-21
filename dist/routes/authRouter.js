"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyJWT_1 = __importDefault(require("../middlewares/verifyJWT"));
const verifyRole_1 = __importDefault(require("../middlewares/verifyRole"));
const userController_1 = require("../controllers/userController");
const managerController_1 = require("../controllers/managerController");
const router = (0, express_1.Router)({ caseSensitive: true }).use(verifyJWT_1.default).use((0, verifyRole_1.default)("employee"));
router.route("/employee/login").post(userController_1.login);
router.route("/manager/login").post(managerController_1.login);
router.route("/manager/register").post(managerController_1.signup);
router.route("/manager/otp/:id").post(managerController_1.verifyOtp);
exports.default = router;
