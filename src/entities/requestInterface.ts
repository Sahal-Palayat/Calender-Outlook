import { Request } from "express";
import IEmployee from "./employee";

export default interface IRequest extends Request {
    user?:IEmployee;
}