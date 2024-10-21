import IRequest from "../entities/requestInterface";
import { NextFunction, Response } from "express";

export default function VerifyRole(role: "employee" | "manager") {
    return async (req: IRequest, _res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new Error("401");
            if (req.user.role !== role) throw new Error("403");
            console.log(req.user,role)
            next();
        } catch (error: any) {
            next(new Error(error.message))
        }
    };
}