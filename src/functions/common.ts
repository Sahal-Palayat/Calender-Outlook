import { isObjectIdOrHexString, Types } from "mongoose";

export function convertObjectId(id: string) {
    return new Types.ObjectId(id);
}

export function checkObjectId(id: string): boolean {
    return isObjectIdOrHexString(id);
}