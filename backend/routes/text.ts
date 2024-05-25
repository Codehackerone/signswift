import express from "express";
import catchAsync from "../utils/catchAsync";
import { verifyToken } from "../middleware";
import { translate } from "../controllers/texts";

const router = express.Router();

router.route("/translate").post(verifyToken, catchAsync(translate));

export default router;
