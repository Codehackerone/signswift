import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import userRoutes from "./routes/user";
import videoRoutes from "./routes/video";
import textRoutes from "./routes/text";
import ExpressError from "./utils/ExpressError";

dotenv.config();

const dbURL = process.env.MONGO_URL!;
mongoose
    .connect(dbURL)
    .then(() => console.log("Connected to DB successfully!"))
    .catch(err => console.log(err));

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/text", textRoutes);

app.use(
    (err: ExpressError, req: Request, res: Response, next: NextFunction) => {
        if (!err.statusCode) {
            return res
                .status(500)
                .json({ message: err.message, statusCode: 500 });
        }
        const { statusCode } = err;
        res.status(statusCode).json(err);
    }
);

app.listen(process.env.PORT, () => {
    console.log(`Connected to PORT ${process.env.PORT}`);
});
