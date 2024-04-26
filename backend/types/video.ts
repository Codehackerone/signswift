export type VideosType = {
    videos: {
        url: string;
        status: "queued" | "processed";
        processed_video_uri: string;
        processed_data: {
            word: string;
            probability: string;
            current_duration: string;
            sentence_till_now: string;
            llm_prediction: string;
        }[];
    }[];
};

export type VideoType = {
    video: {
        url: string;
        status: "queued" | "processed";
        processed_video_uri: string;
        processed_data: {
            word: string;
            probability: string;
            current_duration: string;
            sentence_till_now: string;
            llm_prediction: string;
        }[];
    };
};
