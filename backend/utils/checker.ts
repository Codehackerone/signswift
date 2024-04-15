import mongoose from "mongoose";

export const isValidId = (id: string) => {
    return mongoose.Types.ObjectId.isValid(id);
};
