import { VideosType } from "./video";

export type UserType = VideosType & {
    name: string;
    email: string;
    username: string;
    phoneNumber: string;
};
