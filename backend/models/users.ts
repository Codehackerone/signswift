import { Schema, Model, model, Types } from "mongoose";

interface Video {
    url: string;
    processed: boolean;
    inference: string;
}
interface User {
    email: string;
    username: string;
    name: string;
    password: string;
    phoneNumber?: string;
    videos: Types.DocumentArray<Video>;
}

const userSchema = new Schema<User, Model<User>>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, length: 10, default: "" },
    videos: [
        {
            url: {
                type: String,
                required: true
            },
            processed: {
                type: Boolean,
                default: false
            },
            inference: {
                type: String,
                default: ""
            }
        }
    ]
});

const User = model("User", userSchema);

export default User;
