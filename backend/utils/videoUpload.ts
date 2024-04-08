import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

export const uploader = multer({
    storage: multer.diskStorage({})
});

export const uploadVideo = async (filePath: string) => {
    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
        folder: process.env.CLOUDINARY_FOLDER,
        resource_type: "video"
    });
    return cloudinaryResponse;
};
