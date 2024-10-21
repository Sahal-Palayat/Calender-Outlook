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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('400');
        }
        if (file) {
            profile = await UploadFile(file)
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const hashedPassword = await bcrypt.hash(password, 10);
        const timeout = new Date(Date.now() + 120000);

        const newUser = new User({
            email,
            name,
            password: hashedPassword,
            otp,
            timeout,
            role: "manager",
            profile,
        });

        await newUser.save();

        await sendOtpEmail(email, otp);

        res.status(201).json({ message: 'User created successfully. Please verify the OTP sent to your email.' });
    } catch (e: any) {
        if (e.message === '400') {
            return res.status(400).json({ message: 'User already exists' });
        }
        next(new Error('500'));
    }
}

export async function login(req: IRequest, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('400');  // 400: Invalid email or password
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('400');  // 400: Invalid email or password
        }

        // Create JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });

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
        const { userId } = req.params
        if (!otp || !userId || otp.length < 6 || !checkObjectId(userId)) throw new Error(`401`);
        const user = await User.findOneAndUpdate({ _id: convertObjectId(userId), otp: otp, timeout: { $gt: new Date() } }, { otp: null, timeouts: null });
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
        const existingEmployee = await User.findOne({ email });
        if (!existingEmployee) throw new Error(`400`);
        if (file) {
            profile = await UploadFile(file)
        }
        const employee = new User({
            name, email, password, position, role: "employee", profile, managerId: user._id,
        })
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
        if (employees.length === 0) throw new Error("400");
        const task = new Tasks({
            title, description, start: new Date(start), end: new Date(end), date: new Date(date), priority, employees: employees.map(id => convertObjectId(id)), managerId: user._id, myself
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
        return res.status(200).json({ tasks, user });
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
        if (!checkObjectId(id)) throw new Error("404");
        if (employees.length === 0) throw new Error("400");
        const task = Tasks.findByIdAndUpdate(id, { title, description, start: new Date(start), end: new Date(end), date: new Date(date), priority, employees: employees.map(id => convertObjectId(id)), managerId: user._id, myself })
        if (!task) throw new Error("404");
        return res.status(200).json({ task, user });
    } catch (e: any) {
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