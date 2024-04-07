import { Request, Response, NextFunction } from "express";
import User from "../models/users";
import ExpressError from "../utils/ExpressError";

export const getGestureHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = res.locals.data.id;

    const user = await User.findById(userId);

    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    const { history } = user;

    return res
        .status(200)
        .json({ message: "Gesture history fetched successfully!", history });
};

export const addToGestureHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = res.locals.data.id;
    const { gesture } = req.body;

    if (!gesture) {
        return next(new ExpressError("Missing gesture!", 400));
    }

    const user = await User.findById(userId);

    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    const currentHistory = user.history;
    const updatedHistory = `${currentHistory} ${gesture}`;

    user.history = updatedHistory;
    await user.save();

    return res.status(200).json({
        message: "Gesture history updated succesfully!",
        updatedHistory
    });
};

export const deleteGestureData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = res.locals.data.id;

    const user = await User.findById(userId);

    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    user.history = "";
    await user.save();

    return res.status(200).json({
        message: "Gesture history deleted succesfully!"
    });
};
