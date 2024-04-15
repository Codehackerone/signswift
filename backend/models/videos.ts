import { Model, Schema, Types, model } from "mongoose";

interface Inference {
    word: string;
    probability: string;
    current_duration: string;
    sentence_till_now: string;
    llm_prediction: string;
}

export interface IVideo {
    publicId: string;
    userId: string;
    url: string;
    status: "queued" | "processed";
    processed_data: Types.DocumentArray<Inference>;
    processed_video_uri: string;
}

const videoSchema = new Schema<IVideo, Model<IVideo>>(
    {
        url: { type: String, required: true },
        status: { type: String, required: true },
        processed_video_uri: { type: String, default: "" },
        userId: { type: String, required: true },
        publicId: { type: String, required: true },
        processed_data: [
            {
                word: { type: String, required: true },
                probability: { type: String, required: true },
                current_duration: { type: String, required: true },
                sentence_till_now: { type: String, required: true },
                llm_prediction: { type: String, required: true }
            }
        ]
    },
    { timestamps: true }
);

const Video = model<IVideo, Model<IVideo>>("Video", videoSchema);
export default Video;
