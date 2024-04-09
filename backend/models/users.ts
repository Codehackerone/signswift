import { Schema, Model, model, Types } from "mongoose";
import { Video } from "./videos";

interface User {
    email: string;
    username: string;
    name: string;
    password: string;
    phoneNumber?: string;
    videos: Video[];
}

type UserDocumentProps = {
    videos: Types.DocumentArray<Video>;
};

type UserModelType = Model<User, {}, UserDocumentProps>;

const User = model<User, UserModelType>(
    "User",
    new Schema<User, UserModelType>({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phoneNumber: { type: String, length: 10, default: "" },
        videos: [
            new Schema<Video>({
                url: { type: String, required: true },
                inferences: [{ timestamp: Date, text: String }],
                processed: {
                    type: Boolean,
                    default: false
                },
                publicId: { type: String }
            })
        ]
    })
);

export default User;
