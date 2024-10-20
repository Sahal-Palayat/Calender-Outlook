import { mongooseConfig } from "./config/db";
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config()

const app = express();
const port = 7000;

mongooseConfig()
app.use(cors({ origin: process.env.BASE_URL || '' }))
app.use(express.json());


app.use((err: any, req: any, res: any, next: any) => {
    const status: "401" | "403" | "404" | "500" = err.message || "500";
    const errors = {
        "401": "Unauthorized Access",
        "403": "Forbidden Request",
        "404": "Not Found",
        "500": "Internal Server Error"
    };
    const errorMessage = errors[status] || "Unknown Error";
    res.status(status).json({
        message: errorMessage
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

