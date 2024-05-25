import { Request, Response, NextFunction } from "express";
import ExpressError from "../utils/ExpressError";
import { fetchResponse } from "../utils/languageProcessor";

export const translate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { sentence, language } = req.body;

    if (!sentence || !language) {
        return next(new ExpressError("Missing parameters!", 400));
    }

    const translatedText = await fetchResponse(sentence, language);
    return res.status(200).json({ message: translatedText });
};
