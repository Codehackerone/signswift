import requests
from get_secrets import MISTRAL_URL
from typing import Union


class MistralAPI(object):
    def __init__(self, mistral_url: str = MISTRAL_URL):
        """
        Initializes the MistralAPI class.

        Args:
            mistral_url (str, optional): The URL of the Mistral API. Defaults to MISTRAL_URL.
        """
        self.headers = {"Content-Type": "application/json"}
        self.mistral_url = mistral_url
        self.mistral_health_url = mistral_url + "/v1/models"
        self.mistral_predict_url = mistral_url + "/v1/chat/completions"
        self.model = "mistralai/Mistral-7B-Instruct-v0.2"
        self.top_p = 1
        self.stream = False
        self.safe_prompt = False
        self.random_seed = 101
        self.healthy = False

    def health_check(self) -> bool:
        """
        Performs a health check on the Mistral API.

        Returns:
            bool: True if the API is healthy, False otherwise.
        """
        response = requests.get(self.mistral_health_url)
        try:
            if response.status_code == 200:
                print("[INFO]: Mistral API is healthy.")
                self.healthy = True
                return True

            return False
        except Exception as e:
            print("Error:", e)
            return False

    def call_mistral_api(
        self, text: str, max_tokens: int = 36, temperature: float = 0
    ) -> Union[str, Exception]:
        """
        Calls the Mistral API to generate a response based on the given text.

        Args:
            text (str): The input text for the Mistral API.
            max_tokens (int, optional): The maximum number of tokens to generate. Defaults to 36.
            temperature (float, optional): The temperature value for controlling randomness. Defaults to 0.

        Returns:
            Union[str, Exception]: The generated response from the Mistral API.
        """
        if not self.healthy:
            self.health_check()

        data = {
            "model": self.model,
            "messages": [{"role": "user", "content": text}],
            "temperature": temperature,
            "top_p": self.top_p,
            "max_tokens": max_tokens,
            "stream": self.stream,
            "safe_prompt": self.safe_prompt,
            "random_seed": self.random_seed,
        }

        response = requests.post(
            self.mistral_predict_url, json=data, headers=self.headers
        )

        if response.status_code == 200:
            res = response.json()
            return res["choices"][0]["message"]["content"]
        else:
            print("Error:", response.status_code)
            print("Response:", response.text)
            self.healthy = False
            raise Exception(
                "Mistral API call failed. Check the logs for more information."
            )


if __name__ == "__main__":
    mistral_api = MistralAPI()
    example_prompt = """
    YOu are given a sentence that are recognized by a sign language interpreter.
    Use pronouns, adverbs to complete the sentence, or rearrange the words and make something that makes sense. 
    Do not include any other information in the output and return only one sentence.

    Sentence: apple green like food
    Answer:"""
    print(mistral_api.health_check())
    result = mistral_api.call_mistral_api(example_prompt)
    print(result)
