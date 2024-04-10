import { Types } from "mongoose";

export interface Inference {
    timestamp: Date;
    text: string;
}

export interface Video {
    url: string;
    publicId: string;
    processed: boolean;
    inferences: Types.DocumentArray<Inference>;
}
