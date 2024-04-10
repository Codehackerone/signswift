import ExpressError from "./utils/ExpressError";
import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract the token from the request header
    const token = req.headers["x-access-token"];
    // If token is not present, then send appropriate error
    if (!token) {
        return next(new ExpressError("Missing token!", 403));
    }
    // Verify the JWT Token
    jwt.verify(
        token as string,
        process.env.JWT_SECRET as Secret,
        (err, data) => {
            if (err) {
                return next(new ExpressError("Invalid token!", 401));
            }
            res.locals.data = data;
            next();
        }
    );
};
