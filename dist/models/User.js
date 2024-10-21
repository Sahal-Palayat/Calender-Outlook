"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = require("bcryptjs");
exports.UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    profile: {
        type: String,
    },
    managerId: {
        type: mongoose_1.Types.ObjectId,
    },
    position: {
        type: String,
    },
    role: {
        type: String,
        enum: ["employee", "manager"],
        default: "employee"
    },
    otp: {
        type: String,
    },
    timeout: {
        type: Date,
    },
    verified: {
        type: Boolean,
        default: false
    },
});
exports.UserSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return next();
        try {
            console.log(this.password);
            const hashedPassword = yield (0, bcryptjs_1.hash)(this.password, 10);
            this.password = hashedPassword;
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
const User = (0, mongoose_1.model)("users", exports.UserSchema);
exports.default = User;
