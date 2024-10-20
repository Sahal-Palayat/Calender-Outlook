"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongooseConfig = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongooseConfig = () => {
    mongoose_1.default.connect('mongodb+srv://Sahal:Sa%40115894@cluster0.x1gvuc8.mongodb.net/calender-task').then(() => {
        console.log('Connected to MongoDB');
    }).catch(err => console.log(err));
};
exports.mongooseConfig = mongooseConfig;
