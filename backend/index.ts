import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import userRoutes from "./routes/user";
import historyRoutes from "./routes/history";
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

app.use("/api/users", userRoutes);
app.use("/api/history", historyRoutes);

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

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Connected to PORT ${PORT}`);
});