import { Schema, model, Types } from "mongoose";
import IEmployee from "../entities/employee";
import { hash } from "bcryptjs"
export const UserSchema = new Schema<IEmployee>({
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
        type: Types.ObjectId,
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
})

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const hashedPassword = await hash(this.password, 10);
        this.password = hashedPassword;
        next();
    } catch (error: any) {
        next(error);
    }
});

const User = model<IEmployee>("users", UserSchema)
export default User;