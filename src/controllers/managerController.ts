import { NextFunction, Request, Response } from "express"
import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import IRequest from "../entities/requestInterface";
import { checkObjectId, convertObjectId } from "../functions/common";
import IEmployee from "../entities/employee";
import { UploadFile } from "../functions/upload";
import Tasks from "../models/Tasks";
dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAILER,
        pass: process.env.MAILERPASSWORD,
    },
});

const sendOtpEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: process.env.MAILER,
        to: email,
        subject: 'Your OTP for Signup',
        text: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
};

export async function signup(req: IRequest, res: Response, next: NextFunction) {
    try {
        const { email, name, password } = req.body;
        const file = req.file;
        let profile = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtuphMb4mq-EcVWhMVT8FCkv5dqZGgvn_QiA&s"
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const existingUser = await User.findOne({ email });
        const timeout = new Date(Date.now() + 120000);
        if (existingUser) {
            if (existingUser.verified) throw new Error('400');
            existingUser.otp = otp;
            existingUser.timeout = timeout;
            await existingUser.save()
            await sendOtpEmail(email, otp);
            return res.status(201).json({ message: 'User not yet verified. Please verify the OTP sent to your email.', id: existingUser._id });
        }

        if (file) {
            profile = await UploadFile(file)
        }
        await sendOtpEmail(email, otp);

        const newUser = new User({
            email,
            name,
            password: password,
            otp,
            timeout,
            role: "manager",
            profile,
        });
        console.log(newUser)
        await newUser.save();

        res.status(201).json({ message: 'User created successfully. Please verify the OTP sent to your email.', id: newUser._id });
    } catch (e: any) {
        console.log(e)
        if (e.message === '400') {
            return res.status(400).json({ message: 'User already exists' });
        }
        next(new Error('500'));
    }
}

export async function login(req: IRequest, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        console.log(req.body)
        const user = await User.findOne({ email: email });
        console.log(user)
        if (!user || !user.verified) {
            throw new Error('400');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(isPasswordValid)
        if (!isPasswordValid) {
            throw new Error('400');
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "sahalikka-secret", { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (e: any) {
        if (e.message === '400') {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        next(new Error('500'));
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


export async function verifyOtp(req: IRequest, res: Response, next: NextFunction) {
    try {
        const { otp } = req.body as {
            otp: string;
        };
        const { id } = req.params
        if (!otp || !id || otp.length < 6 || !checkObjectId(id)) throw new Error(`401`);
        const user = await User.findOneAndUpdate({ _id: convertObjectId(id), otp: otp, timeout: { $gt: new Date() } }, { otp: null, timeouts: null, verified: true });
        if (!user) throw new Error(`404`);
        return res.status(200).json({ user })
    } catch (e: any) {
        next(new Error(e.message))
    }
}

export async function addEmployee(req: IRequest, res: Response, next: NextFunction) {
    try {
        const { name, email, password, position } = req.body as IEmployee;
        const file = req.file;
        const user = req.user as IEmployee;
        let profile = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtuphMb4mq-EcVWhMVT8FCkv5dqZGgvn_QiA&s";
        const existingEmployee = await User.findOne({ email: email });
        if (existingEmployee) throw new Error(`400`);
        console.log(file)
        if (file) {
            profile = await UploadFile(file)
        }
        const employee = new User({
            name, email, password, position, role: "employee", profile, managerId: user._id,verified:true
        })
        await employee.save()
        return res.status(200).json({ employee })
    } catch (e: any) {
        if (e.message === '400') {
            return res.status(400).json({ message: 'Employee Already Exists' });
        }
        next(new Error(e.message))
    }
}

export async function deleteEmployee(req: IRequest, res: Response, next: NextFunction) {
    try {
        const { id } = req.params as {
            id: string;
        }
        const user = req.user as IEmployee;
        if (!checkObjectId(id)) throw new Error("404");
        const employee = await User.deleteOne({ _id: convertObjectId(id), managerId: user._id })
        if (employee.deletedCount === 0) throw new Error("400");
        return res.status(200).json({ message: 'Employee deleted successfully' })
    } catch (e: any) {
        if (e.message === '400') {
            return res.status(400).json({ message: 'User Not Found or Not a Manager' });
        }
        next(new Error(e.message))
    }
}

export async function getEmployees(req: IRequest, res: Response, next: NextFunction) {
    try {
        const user = req.user as IEmployee;
        const employees = await User.find({ managerId: user._id })
        return res.status(200).json({ employees, user });
    } catch (e: any) {
        next(new Error(e.message))
    }
}


export async function addTask(req: IRequest, res: Response, next: NextFunction) {
    try {
        const user = req.user as IEmployee;
        const { title, description, employees, end, priority, start, date, myself } = req.body as {
            title: string;
            description: string;
            start: Date;
            end: Date;
            date: Date;
            priority: number;
            employees: string[];
            myself: boolean;
        }
        console.log(req.body)
        const employee = employees.map((id) => {
            return { id: convertObjectId(id) }
        })
        if (employees.length === 0 && !myself) throw new Error("400");
        const task = new Tasks({
            title, description, start: new Date(start), end: new Date(end), employees: employee, date: new Date(date), priority, managerId: user._id, myself
        })
        await task.save()
        return res.status(200).json({ task });
    } catch (e: any) {
        if (e.message === '400') {
            return res.status(400).json({ message: 'Add Atleast an Employee' });
        }
        next(new Error(e.message))
    }
}


export async function getTasks(req: IRequest, res: Response, next: NextFunction) {
    try {
        const user = req.user as IEmployee;
        const tasks = await Tasks.find({ managerId: user._id })
        const employees = await User.find({ managerId: user._id })
        return res.status(200).json({ tasks, user, employees });
    } catch (e: any) {
        next(new Error(e.message))
    }
}


export async function getDetails(req: IRequest, res: Response, next: NextFunction) {
    try {
        const { id } = req.params as {
            id: string;
        }
        const user = req.user as IEmployee;
        if (!checkObjectId(id)) throw new Error("404");
        const task = await Tasks.aggregate([{ $match: { _id: convertObjectId(id), managerId: user._id } }, {
            $lookup: {
                from: "users",
                localField: "employees",
                foreignField: "_id",
                as: "employees"
            }
        }])
        if (!task) throw new Error("404");
        return res.status(200).json({ task, user });
    } catch (e: any) {
        if (e.message === '404') {
            return res.status(400).json({ message: 'No task found' });
        }
        next(new Error(e.message))
    }
}

export async function updateTask(req: IRequest, res: Response, next: NextFunction) {
    try {
        const user = req.user as IEmployee;
        const { id } = req.params as {
            id: string;
        }
        const { title, description, employees, end, priority, start, date, myself } = req.body as {
            title: string;
            description: string;
            start: Date;
            end: Date;
            date: Date;
            priority: number;
            employees: string[];
            myself: boolean;
        }
        console.log(req.body)
        if (!checkObjectId(id)) throw new Error("404");
        if (employees.length === 0 && !myself) throw new Error("400");
        const task = await Tasks.findByIdAndUpdate(
            id,
            { title, description, start: new Date(start), end: new Date(end), date: new Date(date), priority, employees, myself },
            { new: true } 
        ).lean(); if (!task) throw new Error("404");
        return res.status(200).json({ task, user });
    } catch (e: any) {
        console.log(e)
        if (e.message === '404') {
            return res.status(400).json({ message: 'No task found' });
        }
        if (e.message === '400') {
            return res.status(400).json({ message: 'Add Atleast an Employee' });
        }
        next(new Error(e.message))
    }
}

export async function deleteTask(req: IRequest, res: Response, next: NextFunction) {
    try {
        const { id } = req.params as {
            id: string;
        }
        const user = req.user as IEmployee;
        if (!checkObjectId(id)) throw new Error("404");
        const task = await Tasks.deleteOne({ _id: convertObjectId(id), managerId: user._id })
        if (!task.deletedCount) throw new Error("400");
        return res.status(200).json({ message: "Task Deleted Successfully" });
    } catch (e: any) {
        if (e.message === '404') {
            return res.status(400).json({ message: 'No task found' });
        }
        if (e.message === '400') {
            return res.status(400).json({ message: 'Cannot delete this task' });
        }
        next(new Error(e.message))
    }
}