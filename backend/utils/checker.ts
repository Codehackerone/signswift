import mongoose from "mongoose";

export const isValidId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const toMongoId = (id: string) => {
  return new mongoose.Types.ObjectId(id);
};
