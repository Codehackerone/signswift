import express from "express";
import {
    getAllVideos,
    addVideo,
    deleteAllVideos,
    updateVideoDetails
} from "../controllers/video";
import catchAsync from "../utils/catchAsync";
import { verifyToken } from "../middleware";
import { uploader } from "../utils/videoUpload";

const router = express.Router();

router
    .route("/")
    .get(verifyToken, catchAsync(getAllVideos))
    .post(verifyToken, uploader.single("file"), catchAsync(addVideo))
    .delete(verifyToken, catchAsync(deleteAllVideos))
    .put(verifyToken, catchAsync(updateVideoDetails));

export default router;
