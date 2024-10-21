"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.getTasks = getTasks;
exports.getDetails = getDetails;
exports.updateDetails = updateDetails;
exports.verify = verify;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const Tasks_1 = __importDefault(require("../models/Tasks"));
const common_1 = require("../functions/common");
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const user = yield User_1.default.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }
            const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        }
        catch (e) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
}
function getTasks(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const tasks = yield Tasks_1.default.find({ "employees.id": user._id });
            console.log(tasks);
            return res.status(200).json({ tasks, user });
        }
        catch (e) {
            console.log(e);
            next(new Error(e.message));
        }
    });
}
function getDetails(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { id } = req.params;
            if (!(0, common_1.checkObjectId)(id))
                throw new Error("404");
            const task = yield Tasks_1.default.aggregate([{ $match: { _id: (0, common_1.convertObjectId)(id), employees: { $in: [user._id] } } }, {
                    $lookup: {
                        from: "users",
                        localField: "employees",
                        foreignField: "_id",
                        as: "employees"
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "managerId",
                        foreignField: "_id",
                        as: "employees"
                    }
                }]);
            return res.status(200).json({ user, task });
        }
        catch (e) {
            next(new Error(e.message));
        }
    });
}
function updateDetails(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { id } = req.params;
            if (!(0, common_1.checkObjectId)(id))
                throw new Error("404");
            const task = yield Tasks_1.default.findOne({ _id: (0, common_1.convertObjectId)(id), employees: { $in: [user._id] } });
            if (!task)
                throw new Error("404");
            const idx = task.employees.indexOf({ id: user._id, status: "Pending" });
            task.employees[idx] = { id: user._id, status: "Completed" };
            yield task.save();
            return res.status(200).json({ user, task });
        }
        catch (e) {
            next(new Error(e.message));
        }
    });
}
function verify(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (user) {
                return res.status(200).json({ user });
            }
            throw new Error("404");
        }
        catch (e) {
            next(new Error(e.message));
        }
    });
}
