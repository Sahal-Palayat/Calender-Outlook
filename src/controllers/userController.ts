import { NextFunction, Response } from "express"
import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import IRequest from "../entities/requestInterface";
import Tasks from "../models/Tasks";
import IEmployee from "../entities/employee";
import { checkObjectId, convertObjectId } from "../functions/common";


export async function login(req: IRequest, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (e) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getTasks(req: IRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const user = req.user as IEmployee;
        const tasks = await Tasks.find({ employees: { $in: [user.id] } })
        return res.status(200).json({ tasks, user })
    } catch (e: any) {
        next(new Error(e.message))

    }
}

export async function getDetails(req: IRequest, res: Response, next: NextFunction) {
    try {
        const user = req.user as IEmployee;
        const { id } = req.params as {
            id: string;
        }
        if (!checkObjectId(id)) throw new Error("404");
        const task = await Tasks.aggregate([{ $match: { _id: convertObjectId(id), employees: { $in: [user._id] } } }, {
            $lookup: {
                from: "users",
                localField: "employees",
                foreignField: "_id",
                as: "employees"
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "managerId",
                foreignField: "_id",
                as: "employees"
            }
        }])
        return res.status(200).json({ user, task })
    } catch (e: any) {
        next(new Error(e.message))
    }
}

export async function updateDetails(req: IRequest, res: Response, next: NextFunction) {
    try {
        const user = req.user as IEmployee;
        const { id } = req.params as {
            id: string;
        }
        if (!checkObjectId(id)) throw new Error("404");
        const task = await Tasks.findOne({ _id: convertObjectId(id), employees: { $in: [user._id] } });
        if (!task) throw new Error("404");
        const idx = task.employees.indexOf({ id: user._id, status: "Pending" });
        task.employees[idx] = { id: user._id, status: "Completed" };
        await task.save();
        return res.status(200).json({ user, task })
    } catch (e: any) {
        next(new Error(e.message))
    }
}

export async function verify(req: IRequest, res: Response, next: NextFunction) {
    try {
        const user = req.user;
        if (user) {
            return res.status(200).json({ user })
        }
        throw new Error("404")
    } catch (e: any) {
        next(new Error(e.message))
    }
}
