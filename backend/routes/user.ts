import express from "express";
import { login, register, getDetails } from "../controllers/users";
import catchAsync from "../utils/catchAsync";
import { verifyToken } from "../middleware";

const router = express.Router();

router.route("/register").post(catchAsync(register));
router.route("/login").post(catchAsync(login));
router.route("/details").get(verifyToken, catchAsync(getDetails));

export default router;
