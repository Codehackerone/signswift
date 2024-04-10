import { Request, Response, NextFunction, Express } from "express";
import User from "../models/users";
import ExpressError from "../utils/ExpressError";
import { Multer } from "multer";
import {
    uploadVideoToCloudinary,
    deleteVideoFromCloudinary,
    deleteAllVideosFromCloudinary
} from "../utils/video";
import { Inference } from "../models/videos";

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

    // Fetch user from database
    const user = await User.findById(userId);

    // Check if user is present or not
    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    // Find the video using the videoId
    const video = user.videos.filter(
        video => video._id?.toString() === videoId
    );

    // If the video is present (i.e. the videoId is valid)
    if (video.length !== 0) {
        const { processed, url, inferences } = video[0];
        return res.status(200).json({
            message: "Video fetched successfully!",
            video: { processed, url, inferences }
        });
    }

    return res.status(403).json({
        message:
            "Invalid video id / You don't have permission to get details of this video!",
        video: {}
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

    // Add the new video to the current user array
    user.videos.push({ url, publicId });
    // Save the updated user
    await user.save();

    res.status(200).json({
        message: "Videos uploaded successfully!",
        url,
        userId,
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

    // Upload all videos from Cloudinary
    await deleteAllVideosFromCloudinary();

    // Update the videos array for the current user
    await user.updateOne({ $set: { videos: [] } });

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

    // Fetch user from database
    const user = await User.findById(userId);

    // Check if user is present or not
    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    // Find the public Id of the video that is to be deleted
    let publicId = "";
    user.videos.forEach(video => {
        if (video._id?.toString() === videoId) {
            publicId = video.publicId;
        }
    });

    // public id is not found, means the video id doesn't belong to authenticated user
    if (!publicId) {
        return next(
            new ExpressError(
                "Invalid video id / You don't have permission to delete this video!",
                403
            )
        );
    }

    // Delete the video from cloudinary with the computed public Id
    await deleteVideoFromCloudinary(publicId);

    // Fetch user from database and delete the having id as videoId
    await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { videos: { _id: videoId } } },
        { runValidators: true }
    );

    return res.status(200).json({ message: "Video deleted successfully!" });
};

export const updateVideoDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get user id, video id and details from request body
    const {
        userId,
        videoId,
        inference
    }: { userId: string; videoId: string; inference: Inference[] } = req.body;

    // Check for missing parameters
    if (!userId || !videoId || !inference) {
        return next(new ExpressError("Missing parameters!", 400));
    }

    // Fetch user from database and update the video data having id as videoId
    await User.findOneAndUpdate(
        { _id: userId, "videos._id": videoId },
        {
            $set: {
                "videos.$.inferences": inference,
                "videos.$.processed": true
            }
        },
        { runValidators: true }
    );

    return res
        .status(200)
        .json({ message: "Video details updated successfully!" });
};
