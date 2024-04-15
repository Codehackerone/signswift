import { Request, Response, NextFunction, Express } from "express";
import User from "../models/users";
import Video, { IVideo } from "../models/videos";
import ExpressError from "../utils/ExpressError";
import { Multer } from "multer";
import {
    uploadVideoToCloudinary,
    deleteVideoFromCloudinary,
    deleteAllVideosFromCloudinary
} from "../utils/video";
import { isValidId } from "../utils/checker";

export const getAllVideos = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get user id from locals (set up through middleware)
    const userId = res.locals.data.id;

    // Check for missing parameters
    if (!userId) {
        return next(new ExpressError("Missing parameters!", 400));
    }

    // Check if the user id is valid or not
    if (!isValidId(userId)) {
        return next(new ExpressError("Invalid user Id", 403));
    }

    // Fetch user from database
    const user = await User.findById(userId).populate<{ videos: IVideo[] }>(
        "videos"
    );

    // Check if user is present or not
    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    // Extract useful properties from video data
    const videos = user.videos.map(video => {
        return {
            url: video.url,
            processed_data: video.processed_data,
            processed_video_uri: video.processed_video_uri,
            status: video.status
        };
    });

    return res.status(200).json({
        message: "Videos fetched successfully!",
        videos
    });
};

export const getVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get user id from locals (set up through middleware)
    const userId = res.locals.data.id;
    // Get video id from request body
    const { videoId } = req.body;

    // Check for missing parameters
    if (!userId || !videoId) {
        return next(new ExpressError("Missing parameters!", 400));
    }

    // Check if the user id is valid or not
    if (!isValidId(userId)) {
        return next(new ExpressError("Invalid user Id", 403));
    }
    // Check if the video id is valid or not
    if (!isValidId(videoId)) {
        return next(new ExpressError("Invalid video Id", 403));
    }

    // Fetch the video from database
    const video = await Video.findById(videoId);
    // Check if video is present or not
    if (!video) {
        return res.status(404).json({ message: "Video not found!" });
    }

    // Fetch user from database
    const user = await User.findById(userId);
    // Check if user is present or not
    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    const isAuthorized = user.videos.includes(videoId);

    // Check if the video belongs to the requesting user or not
    if (!isAuthorized) {
        return res.status(401).json({
            message: "You don't have permission to get details of this video!"
        });
    }

    return res.status(200).json({
        message: "Video fetched successfully!",
        video: {
            url: video.url,
            processed_data: video.processed_data,
            processed_video_uri: video.processed_video_uri,
            status: video.status
        }
    });
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

    // Check for missing parameters
    if (!userId) {
        return next(new ExpressError("Missing parameters!", 400));
    }

    // Check if the user id is valid or not
    if (!isValidId(userId)) {
        return next(new ExpressError("Invalid user Id", 403));
    }

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
    const { url, publicId } = await uploadVideoToCloudinary(file.path);

    // Add new video in Video model
    const video = new Video({
        url,
        publicId,
        userId,
        status: "queued"
    });
    await video.save();

    // Add the new video to the current user array
    user.videos.push(video._id);
    // Save the updated user
    await user.save();

    res.status(200).json({
        message: "Videos uploaded successfully!",
        url,
        userId,
        videoId: video._id
    });
};

export const deleteAllVideos = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get user id from locals (set up through middleware)
    const userId = res.locals.data.id;

    // Check for missing parameters
    if (!userId) {
        return next(new ExpressError("Missing parameters!", 400));
    }

    // Check if the user id is valid or not
    if (!isValidId(userId)) {
        return next(new ExpressError("Invalid user Id", 403));
    }

    // Fetch user from database
    const user = await User.findById(userId);

    // Check if user is present or not
    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    // Delete all videos from Cloudinary
    await deleteAllVideosFromCloudinary();

    // Delete all videos from Video model corresponding to the current user
    await Video.deleteMany({ _id: { $in: user.videos } });

    // Clear the videos array for the current user
    await user.updateOne(
        { $set: { videos: [] } },
        { new: true, runValidators: true }
    );

    return res.status(200).json({ message: "Videos deleted successfully!" });
};

export const deleteVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get user id from locals (set up through middleware)
    const userId = res.locals.data.id;
    // Get video id from request body
    const { videoId } = req.body;

    // Check for missing parameters
    if (!userId || !videoId) {
        return next(new ExpressError("Missing parameters!", 400));
    }

    // Check if the user id is valid or not
    if (!isValidId(userId)) {
        return next(new ExpressError("Invalid user Id", 403));
    }
    // Check if the video id is valid or not
    if (!isValidId(videoId)) {
        return next(new ExpressError("Invalid video Id", 403));
    }

    // Fetch the video from database
    const video = await Video.findById(videoId);
    // Check if the video is present or not
    if (!video) {
        return res.status(404).json({ message: "Video not found!" });
    }

    // Fetch the user from database
    const user = await User.findById(userId);
    // Check if the user is present or not
    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    const isAuthorized = user.videos.includes(videoId);

    // Check if the video belongs to the requesting user or not
    if (!isAuthorized) {
        return res.status(401).json({
            message: "You don't have permission to delete this video!"
        });
    }

    // Find the public Id of the video that is to be deleted
    const publicId = video.publicId;
    // Check if the public Id is present or not
    if (!publicId) {
        return next(new ExpressError("Public Id not found!", 500));
    }

    // Delete the video from cloudinary using the public Id
    await deleteVideoFromCloudinary(publicId);

    // Remove the video from the current user's videos array
    await user.updateOne(
        { $pull: { videos: videoId } },
        { runValidators: true, new: true }
    );
    // Delete the video from the Video model
    await video.deleteOne();

    return res.status(200).json({ message: "Video deleted successfully!" });
};
