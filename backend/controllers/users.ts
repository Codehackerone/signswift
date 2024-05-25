import { Request, Response, NextFunction } from "express";
import User from "../models/users";
import ExpressError from "../utils/ExpressError";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { isValidId, toMongoId } from "../utils/checker";
import { UserType } from "../types/user";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Retrieve data from request body
  const { name, email, username, password, phoneNumber } = req.body;

  // Check for missing parameters
  if (!email || !username || !password || !name) {
    return next(new ExpressError("Missing parameters!", 400));
  }

  // Fetch user from database
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
    name,
    phoneNumber,
  });
  // Save in database
  await newUser.save();

  // User successfully registered
  res.status(200).json({
    message: "User registered successfully!",
  });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Retrieve data from request body
  const { email, password } = req.body;

  // Check for missing parameters
  if (!email || !password) {
    return next(new ExpressError("Missing parameters!", 400));
  }

  // Fetch user from database
  const user = await User.findOne({ email });

  // Check the user exists or not
  if (!user) {
    return next(
      new ExpressError("User doesn't not exist. Kindly register!", 404),
    );
  }

  // If the user exist, the match the password
  const isMatch = await bcrypt.compare(password, user.password);

  // If the password matches, then user can be logged in
  if (isMatch) {
    // sending jwt token that will be stored in local storage in front end
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as Secret);
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
  next: NextFunction,
) => {
  // Get user id from locals (set up through middleware)
  const userId = res.locals.data.id;

  // Check if the user id is valid or not
  if (!isValidId(userId)) {
    return next(new ExpressError("Invalid user Id", 403));
  }

  // Get the details of the user using aggregation
  const user = await User.aggregate<UserType>([
    { $match: { _id: toMongoId(userId) } },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        email: 1,
        username: 1,
        phoneNumber: 1,
        videos: {
          url: 1,
          status: 1,
          processed_video_uri: 1,
          processed_data: {
            word: 1,
            probability: 1,
            current_duration: 1,
            sentence_till_now: 1,
            llm_prediction: 1,
          },
        },
      },
    },
  ]);

  // Check if user is present or not
  if (user.length === 0) {
    return next(new ExpressError("User not found!", 404));
  }

  return res.status(200).json({
    message: "User details fetched successfully!",
    data: { ...user[0] },
  });
};
