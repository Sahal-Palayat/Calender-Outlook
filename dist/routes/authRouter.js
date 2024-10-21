"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const managerController_1 = require("../controllers/managerController");
const multer_1 = __importDefault(require("../middlewares/multer"));
const router = (0, express_1.Router)({ caseSensitive: true });
router.route("/employee/login").post(userController_1.login);
router.route("/manager/login").post(managerController_1.login);
router.route("/manager/register").post(multer_1.default.single("profile"), managerController_1.signup);
router.route("/manager/otp/:id").post(managerController_1.verifyOtp);
exports.default = router;
