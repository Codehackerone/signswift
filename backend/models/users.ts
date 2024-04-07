import { Schema, Model, model } from "mongoose";

interface User {
    email: string;
    username: string;
    name: string;
    password: string;
    phoneNumber?: string;
    history?: string;
}

const userSchema = new Schema<User, Model<User>>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, length: 10, default: "" },
    history: { type: String, default: "" }
});

const User = model("User", userSchema);

export default User;
