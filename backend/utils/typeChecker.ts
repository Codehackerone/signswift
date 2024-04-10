import { Inference } from "../models/videos";

export const inferenceFormatChecker = (
    inference: Inference[]
): inference is Inference[] => {
    for (let i = 0; i < inference.length; i++) {
        if (!inference[i].text || !inference[i].timestamp) {
            return false;
        }
    }
    return true;
};
