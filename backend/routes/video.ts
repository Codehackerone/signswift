import express from "express";
import {
    getVideo,
    addVideo,
    deleteVideo,
    getAllVideos,
    deleteAllVideos,
    updateVideoDetails
} from "../controllers/video";
import catchAsync from "../utils/catchAsync";
import { verifyToken } from "../middleware";
import { uploader } from "../utils/video";

const router = express.Router();

router
    .route("/")
    .get(verifyToken, catchAsync(getVideo))
    .post(verifyToken, uploader.single("file"), catchAsync(addVideo))
    .put(catchAsync(updateVideoDetails))
    .delete(verifyToken, catchAsync(deleteVideo));

router
    .route("/all")
    .get(verifyToken, catchAsync(getAllVideos))
    .delete(verifyToken, catchAsync(deleteAllVideos));

export default router;
