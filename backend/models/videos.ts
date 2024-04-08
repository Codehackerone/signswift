import { Types } from "mongoose";

export interface Inference {
    timestamp: Date;
    text: string;
}

export interface Video {
    url: string;
    processed: boolean;
    inferences: Types.DocumentArray<Inference>;
}
