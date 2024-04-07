import express from "express";
import {
    getGestureHistory,
    addToGestureHistory,
    deleteGestureData
} from "../controllers/history";
import catchAsync from "../utils/catchAsync";
import { verifyToken } from "../middleware";

const router = express.Router();

router
    .route("/")
    .get(verifyToken, catchAsync(getGestureHistory))
    .post(verifyToken, catchAsync(addToGestureHistory))
    .delete(verifyToken, catchAsync(deleteGestureData));

export default router;
