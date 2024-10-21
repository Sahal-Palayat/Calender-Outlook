import { ObjectId } from "mongoose";

export default interface ITasks extends Document {
    title: string;
    description: string;
    date: Date;
    start: Date;
    end: Date;
    employees: { id: ObjectId, status: "Pending" | "Completed" | "Progressing" }[];
    completed:boolean;
    managerId: ObjectId;
    priority: number;
    myself:boolean;
}