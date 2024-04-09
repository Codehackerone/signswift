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
    storage: multer.diskStorage({}),
    limits: { fileSize: 20 * 1000000 }
});

export const uploadVideoToCloudinary = async (filePath: string) => {
    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
        folder: process.env.CLOUDINARY_FOLDER,
        resource_type: "video"
    });
    return cloudinaryResponse;
};

export const deleteVideoFromCloudinary = async (publicId: string) => {
    await cloudinary.uploader.destroy(publicId, {
        type: "upload",
        resource_type: "video",
        invalidate: true
    });
};

export const deleteAllVideosFromCloudinary = async () => {
    await cloudinary.api.delete_resources_by_prefix(
        `${process.env.CLOUDINARY_FOLDER}/`,
        { resource_type: "video", type: "upload" }
    );
};
