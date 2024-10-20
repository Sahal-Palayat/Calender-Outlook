"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const AppConfig = {
    port: process.env.PORT || 3000,
    apiPrefix: '/api',
    jwtSecret: process.env.JWT_SECRET || 'sahalikka-secret',
    jwtExpiresIn: '12h',
};
exports.default = AppConfig;
