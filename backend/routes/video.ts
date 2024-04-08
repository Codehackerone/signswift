import express from "express";
import { getAllVideos, addVideo, deleteAllVideos } from "../controllers/video";
import catchAsync from "../utils/catchAsync";
import { verifyToken } from "../middleware";
import { uploader } from "../utils/videoUpload";

const router = express.Router();

router
    .route("/")
    .get(verifyToken, catchAsync(getAllVideos))
    .post(verifyToken, uploader.single("file"), catchAsync(addVideo))
    .delete(verifyToken, catchAsync(deleteAllVideos));

export default router;
