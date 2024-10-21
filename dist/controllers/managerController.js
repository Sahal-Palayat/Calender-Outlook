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
exports.signup = signup;
exports.login = login;
exports.verify = verify;
exports.verifyOtp = verifyOtp;
exports.addEmployee = addEmployee;
exports.deleteEmployee = deleteEmployee;
exports.getEmployees = getEmployees;
exports.addTask = addTask;
exports.getTasks = getTasks;
exports.getDetails = getDetails;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const common_1 = require("../functions/common");
const upload_1 = require("../functions/upload");
const Tasks_1 = __importDefault(require("../models/Tasks"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAILER,
        pass: process.env.MAILERPASSWORD,
    },
});
const sendOtpEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: process.env.MAILER,
        to: email,
        subject: 'Your OTP for Signup',
        text: `Your OTP is ${otp}`,
    };
    yield transporter.sendMail(mailOptions);
});
function signup(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, name, password } = req.body;
            const file = req.file;
            let profile = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtuphMb4mq-EcVWhMVT8FCkv5dqZGgvn_QiA&s";
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const existingUser = yield User_1.default.findOne({ email });
            const timeout = new Date(Date.now() + 120000);
            if (existingUser) {
                if (existingUser.verified)
                    throw new Error('400');
                existingUser.otp = otp;
                existingUser.timeout = timeout;
                yield existingUser.save();
                yield sendOtpEmail(email, otp);
                return res.status(201).json({ message: 'User not yet verified. Please verify the OTP sent to your email.', id: existingUser._id });
            }
            if (file) {
                profile = yield (0, upload_1.UploadFile)(file);
            }
            yield sendOtpEmail(email, otp);
            const newUser = new User_1.default({
                email,
                name,
                password: password,
                otp,
                timeout,
                role: "manager",
                profile,
            });
            console.log(newUser);
            yield newUser.save();
            res.status(201).json({ message: 'User created successfully. Please verify the OTP sent to your email.', id: newUser._id });
        }
        catch (e) {
            console.log(e);
            if (e.message === '400') {
                return res.status(400).json({ message: 'User already exists' });
            }
            next(new Error('500'));
        }
    });
}
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            console.log(req.body);
            const user = yield User_1.default.findOne({ email: email });
            console.log(user);
            if (!user || !user.verified) {
                throw new Error('400');
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
            console.log(isPasswordValid);
            if (!isPasswordValid) {
                throw new Error('400');
            }
            const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "sahalikka-secret", { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        }
        catch (e) {
            if (e.message === '400') {
                return res.status(400).json({ message: 'Invalid email or password' });
            }
            next(new Error('500'));
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
function verifyOtp(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { otp } = req.body;
            const { id } = req.params;
            if (!otp || !id || otp.length < 6 || !(0, common_1.checkObjectId)(id))
                throw new Error(`401`);
            const user = yield User_1.default.findOneAndUpdate({ _id: (0, common_1.convertObjectId)(id), otp: otp, timeout: { $gt: new Date() } }, { otp: null, timeouts: null, verified: true });
            if (!user)
                throw new Error(`404`);
            return res.status(200).json({ user });
        }
        catch (e) {
            next(new Error(e.message));
        }
    });
}
function addEmployee(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, email, password, position } = req.body;
            const file = req.file;
            const user = req.user;
            let profile = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtuphMb4mq-EcVWhMVT8FCkv5dqZGgvn_QiA&s";
            const existingEmployee = yield User_1.default.findOne({ email: email });
            if (existingEmployee)
                throw new Error(`400`);
            console.log(file);
            if (file) {
                profile = yield (0, upload_1.UploadFile)(file);
            }
            const employee = new User_1.default({
                name, email, password, position, role: "employee", profile, managerId: user._id, verified: true
            });
            yield employee.save();
            return res.status(200).json({ employee });
        }
        catch (e) {
            if (e.message === '400') {
                return res.status(400).json({ message: 'Employee Already Exists' });
            }
            next(new Error(e.message));
        }
    });
}
function deleteEmployee(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const user = req.user;
            if (!(0, common_1.checkObjectId)(id))
                throw new Error("404");
            const employee = yield User_1.default.deleteOne({ _id: (0, common_1.convertObjectId)(id), managerId: user._id });
            if (employee.deletedCount === 0)
                throw new Error("400");
            return res.status(200).json({ message: 'Employee deleted successfully' });
        }
        catch (e) {
            if (e.message === '400') {
                return res.status(400).json({ message: 'User Not Found or Not a Manager' });
            }
            next(new Error(e.message));
        }
    });
}
function getEmployees(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const employees = yield User_1.default.find({ managerId: user._id });
            return res.status(200).json({ employees, user });
        }
        catch (e) {
            next(new Error(e.message));
        }
    });
}
function addTask(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { title, description, employees, end, priority, start, date, myself } = req.body;
            console.log(req.body);
            const employee = employees.map((id) => {
                return { id: (0, common_1.convertObjectId)(id) };
            });
            if (employees.length === 0 && !myself)
                throw new Error("400");
            const task = new Tasks_1.default({
                title, description, start: new Date(start), end: new Date(end), employees: employee, date: new Date(date), priority, managerId: user._id, myself
            });
            yield task.save();
            return res.status(200).json({ task });
        }
        catch (e) {
            if (e.message === '400') {
                return res.status(400).json({ message: 'Add Atleast an Employee' });
            }
            next(new Error(e.message));
        }
    });
}
function getTasks(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const tasks = yield Tasks_1.default.find({ managerId: user._id });
            const employees = yield User_1.default.find({ managerId: user._id });
            return res.status(200).json({ tasks, user, employees });
        }
        catch (e) {
            next(new Error(e.message));
        }
    });
}
function getDetails(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const user = req.user;
            if (!(0, common_1.checkObjectId)(id))
                throw new Error("404");
            const task = yield Tasks_1.default.aggregate([{ $match: { _id: (0, common_1.convertObjectId)(id), managerId: user._id } }, {
                    $lookup: {
                        from: "users",
                        localField: "employees",
                        foreignField: "_id",
                        as: "employees"
                    }
                }]);
            if (!task)
                throw new Error("404");
            return res.status(200).json({ task, user });
        }
        catch (e) {
            if (e.message === '404') {
                return res.status(400).json({ message: 'No task found' });
            }
            next(new Error(e.message));
        }
    });
}
function updateTask(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { id } = req.params;
            const { title, description, employees, end, priority, start, date, myself } = req.body;
            console.log(req.body);
            if (!(0, common_1.checkObjectId)(id))
                throw new Error("404");
            if (employees.length === 0 && !myself)
                throw new Error("400");
            const task = yield Tasks_1.default.findByIdAndUpdate(id, { title, description, start: new Date(start), end: new Date(end), date: new Date(date), priority, employees, myself }, { new: true }).lean();
            if (!task)
                throw new Error("404");
            return res.status(200).json({ task, user });
        }
        catch (e) {
            console.log(e);
            if (e.message === '404') {
                return res.status(400).json({ message: 'No task found' });
            }
            if (e.message === '400') {
                return res.status(400).json({ message: 'Add Atleast an Employee' });
            }
            next(new Error(e.message));
        }
    });
}
function deleteTask(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const user = req.user;
            if (!(0, common_1.checkObjectId)(id))
                throw new Error("404");
            const task = yield Tasks_1.default.deleteOne({ _id: (0, common_1.convertObjectId)(id), managerId: user._id });
            if (!task.deletedCount)
                throw new Error("400");
            return res.status(200).json({ message: "Task Deleted Successfully" });
        }
        catch (e) {
            if (e.message === '404') {
                return res.status(400).json({ message: 'No task found' });
            }
            if (e.message === '400') {
                return res.status(400).json({ message: 'Cannot delete this task' });
            }
            next(new Error(e.message));
        }
    });
}
