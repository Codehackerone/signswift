import { Request, Response, NextFunction, Express } from "express";
import User from "../models/users";
import ExpressError from "../utils/ExpressError";
import { Multer } from "multer";
import { uploadVideo } from "../utils/videoUpload";

export const getAllVideos = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get user id from locals (set up through middleware)
    const userId = res.locals.data.id;
    // Fetch user from database
    const user = await User.findById(userId);

    // Check if user is present or not
    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    return res
        .status(200)
        .json({ message: "Videos fetched successfully!", videos: user.videos });
};

export const addVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get user id from locals (set up through middleware)
    const userId = res.locals.data.id;
    // Get the video file from the frontend
    const file = req.file as Express.Multer.File;

    // Fetch user from database
    const user = await User.findById(userId);

    // Check if user is present or not
    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }
    // Check if file is present or not
    if (!file) {
        return next(new ExpressError("Video file not found!", 400));
    }

    // Upload the video to Cloudinary
    const response = await uploadVideo(file.path);
    // Get the hosted video URL
    const videoURL = response?.secure_url;

    // Add the new video to the current user array
    user.videos.push({ url: videoURL });
    // Save the updated user
    await user.save();

    res.status(200).json({
        message: "Videos uploaded successfully!",
        url: videoURL,
        videoId: user.videos[user.videos.length - 1]._id
    });
};

export const deleteAllVideos = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get user id from locals (set up through middleware)
    const userId = res.locals.data.id;
    // Fetch user from database
    const user = await User.findById(userId);

    // Check if user is present or not
    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    // Update the videos array for the current user
    await user.updateOne({ $set: { videos: [] } });

    return res.status(200).json({ message: "Videos deleted successfully!" });
};
