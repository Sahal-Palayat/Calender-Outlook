import { UploadApiResponse } from 'cloudinary';
import cloudinaryV2 from '../config/cloudinary';
import fs from 'fs'


export const UploadFile: Function = async (file: Express.Multer.File) => {
    try {
        const fileBuffer = fs.readFileSync(file.path)
        const fileString = fileBuffer.toString('base64')
        const result: UploadApiResponse = await cloudinaryV2.uploader.upload(`data:${file.mimetype};base64,${fileString}`, {
            folder: 'User Profile'
        });
        fs.unlinkSync(file.path)
        return result.secure_url
    } catch (error) {
        console.log(error);

        return false

    }
}