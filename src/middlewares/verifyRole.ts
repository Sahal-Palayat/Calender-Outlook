import * as JWT from "jsonwebtoken";
import IRequest from "../entities/requestInterface";
import { NextFunction } from "express";

export default function VerifyRole(role: string) {
    return async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new Error("401");
            if (req.user.role !== role) throw new Error("403");
            next();
        } catch (error: any) {
            next(new Error(error.message))
        }
    };
}