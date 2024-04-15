import { Schema, Model, model, Types } from "mongoose";
import Video from "./videos";

interface User {
    email: string;
    username: string;
    name: string;
    password: string;
    phoneNumber?: string;
    videos: Types.ObjectId[];
}

type UserDocumentProps = {
    videos: Types.ObjectId[];
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
        videos: [{ type: Schema.Types.ObjectId, ref: "Video" }]
    })
);

export default User;
