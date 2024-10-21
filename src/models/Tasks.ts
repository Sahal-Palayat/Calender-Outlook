import ITasks from "@/entities/tasks";
import { model, Schema, Types } from "mongoose";

const TaskSchema = new Schema<ITasks>({
    title: String,
    description: String,
    employees: {
        type: [{
            id: Types.ObjectId,
            status: {
                type: String,
                default: "Pending",
                enum: ["Pending", "Completed", "Progressing"]
            },
        }],
        required: true,
    },
    start: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    managerId: {
        type: Types.ObjectId,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    priority: {
        type: Number,
        default: 1,
        enum: [1, 2, 3]
    },
    myself: {
        type: Boolean,
        default: false,
    }

})

const Tasks = model<ITasks>("tasks", TaskSchema)
export default Tasks;