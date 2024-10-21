import * as JWT from "jsonwebtoken";
import IRequest from "../entities/requestInterface";
import { NextFunction, Response } from "express";
import AppConfig from "../config/jwt";
import User from "../models/User";
interface IJWT extends JWT.JwtPayload {
    userId: string;
}
export default async function VerifyJWT(req: IRequest, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) throw new Error("401");
        const decoded = JWT.verify(token, AppConfig.jwtSecret) as IJWT;
        if (!decoded.userId) throw new Error("401");
        const user = await User.findById(decoded.userId);
        if (!user) throw new Error("404");
        req.user = user;
        next()
    } catch (error: any) {
        next(new Error(error.message));
    }
}