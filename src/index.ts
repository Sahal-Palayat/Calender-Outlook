import { mongooseConfig } from "./config/db";
import managerRouter from "./routes/managerRouter";
import userRouter from "./routes/userRouter";
import authRouter from "./routes/authRouter";
import { config } from "dotenv"
config()
import express from "express";
import cors from "cors";
import morgan from "morgan"


const app = express();
const port = 7000;
app.use(morgan("dev"))


mongooseConfig()
app.use(cors({
    origin: process.env.BASE_URL || '',
    credentials: true,
    optionsSuccessStatus: 201,
    preflightContinue: false,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/employee", userRouter)
app.use("/manager", managerRouter)
app.use("/auth", authRouter)

app.use((err: any, _req: any, res: any, _next: any) => {
    const status: "401" | "403" | "404" | "500" = err.message || "500";
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

