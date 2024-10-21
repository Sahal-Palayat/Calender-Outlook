"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const managerRouter_1 = __importDefault(require("./routes/managerRouter"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
const port = 7000;
app.use((0, morgan_1.default)("dev"));
(0, db_1.mongooseConfig)();
app.use((0, cors_1.default)({
    origin: process.env.BASE_URL || '',
    credentials: true,
    optionsSuccessStatus: 201,
    preflightContinue: false,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/employee", userRouter_1.default);
app.use("/manager", managerRouter_1.default);
app.use("/auth", authRouter_1.default);
app.use((err, _req, res, _next) => {
    const status = err.message || "500";
    const errors = {
        "401": "Unauthorized Access",
        "403": "Forbidden Request",
        "404": "Not Found",
        "500": "Internal Server Error"
    };
    const errorMessage = errors[status] || "Unknown Error";
    res.status(Number(status)).json({
        message: errorMessage
    });
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
