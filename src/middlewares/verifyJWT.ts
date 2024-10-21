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
        console.log(token,req.headers)
        if (!token) throw new Error("401");
        const decoded = JWT.verify(token, AppConfig.jwtSecret) as IJWT;
        if (!decoded.id) throw new Error("401");
        const user = await User.findById(decoded.id);
        if (!user) throw new Error("404"); 
        console.log(user)
        if(!user.verified)throw new Error("404"); 
        req.user = user;
        next()
    } catch (error: any) {
        console.log(error.message)
        next(new Error("401"));
    }
}