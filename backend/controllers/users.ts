import { Request, Response, NextFunction } from "express";
import User from "../models/users";
import ExpressError from "../utils/ExpressError";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Retrieve data from request body
    const { name, email, username, password } = req.body;

    // Check for missing parameters
    if (!email || !username || !password || !name) {
        return next(new ExpressError("Missing parameters!", 400));
    }

    const user = await User.findOne({ email });

    // Check the user already exists or not
    if (user) {
        return next(new ExpressError("User already exists!", 409));
    }

    // User can be registered now
    // Generate hashed password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = new User({
        email,
        username,
        password: hashedPassword,
        name
    });
    // Save in database
    await newUser.save();

    // User successfully registered
    res.status(200).json({
        message: "User registered successfully!"
    });
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Retrieve data from request body
    const { email, password } = req.body;

    // Check for missing parameters
    if (!email || !password) {
        return next(new ExpressError("Missing parameters!", 400));
    }

    const user = await User.findOne({ email });

    // Check the user exists or not
    if (!user) {
        return next(
            new ExpressError("User doesn't not exist. Kindly register!", 404)
        );
    }

    // If the user exist, the match the password
    const isMatch = await bcrypt.compare(password, user.password);

    // If the password matches, then user can be logged in
    if (isMatch) {
        // sending jwt token that will be stored in local storage in front end
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as Secret
        );
        return res
            .status(200)
            .json({ message: "User logged in successfully!", auth: token });
    }
    // Else send appropriate error
    else {
        return next(new ExpressError("Invalid Credentials", 404));
    }
};

export const getDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = res.locals.data.id;

    const user = await User.findById(userId);

    if (!user) {
        return next(new ExpressError("User not found!", 404));
    }

    const { name, username, email, phoneNumber, videos } = user;

    return res.status(200).json({ name, username, email, videos, phoneNumber });
};
