"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TaskSchema = new mongoose_1.Schema({
    title: String,
    description: String,
    employees: {
        type: [{
                id: mongoose_1.Types.ObjectId,
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
        type: mongoose_1.Types.ObjectId,
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
});
const Tasks = (0, mongoose_1.model)("tasks", TaskSchema);
exports.default = Tasks;
