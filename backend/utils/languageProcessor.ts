import { MistralAPIResponse } from "../types/language";

export const fetchResponse = async (sentence: string, language: string) => {
  const prompt = `
    You are a language translator. I will give you a sentence in english and you have to convert it to ${language}. Translate the given text to only ${language} and no other language.
    The output should strictly follow the following JSON format.
    {
        translated_text: 
    }
    Sentence: ${sentence}
    `;

  const data = await fetch(`${process.env.MISTRAL_URL}/v1/chat/completions`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      top_p: 1,
      stream: false,
      safe_prompt: false,
      random_seed: 101,
    }),
  });
  const response = (await data.json()) as MistralAPIResponse;
  const answer = response.choices[0].message.content;
  const parsedAnswer = JSON.parse(answer);
  return parsedAnswer.translated_text || "Parsing error!";
};
