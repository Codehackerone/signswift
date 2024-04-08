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
    const userId = res.locals.data.id;

    const user = await User.findById(userId);

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
    const userId = res.locals.data.id;
    const file = req.file as Express.Multer.File;

    const user = await User.findById(userId);

    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }
    if (!file) {
        return next(new ExpressError("Video file not found!", 400));
    }

    const response = await uploadVideo(file.path);
    const videoURL = response?.secure_url;

    user.videos.push({ url: videoURL });
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
    const userId = res.locals.data.id;

    const user = await User.findById(userId);

    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    await user.updateOne({ $set: { videos: [] } });

    return res.status(200).json({ message: "Videos deleted successfully!" });
};
