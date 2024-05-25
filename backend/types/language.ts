export type MistralAPIResponse = {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_token: number;
        total_token: number;
        completion_tokens: number;
    };
};
