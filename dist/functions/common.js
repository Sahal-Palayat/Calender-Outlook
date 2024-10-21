"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertObjectId = convertObjectId;
exports.checkObjectId = checkObjectId;
const mongoose_1 = require("mongoose");
function convertObjectId(id) {
    return new mongoose_1.Types.ObjectId(id);
}
function checkObjectId(id) {
    return (0, mongoose_1.isObjectIdOrHexString)(id);
}
