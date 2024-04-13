import requests
from get_secrets import MISTRAL_URL


def call_mistral_api(text: str, max_tokens: int = 36, temperature: float = 0) -> str:
    """
    Calls the Mistral API to generate a response based on the given text.

    Args:
        text (str): The input text for the Mistral API.
        max_tokens (int, optional): The maximum number of tokens to generate. Defaults to 36.
        temperature (float, optional): The temperature value for controlling randomness. Defaults to 0.

    Returns:
        str: The generated response from the Mistral API.
    """
    headers = {"Content-Type": "application/json"}
    data = {
        "model": "mistralai/Mistral-7B-Instruct-v0.2",
        "messages": [{"role": "user", "content": text}],
        "temperature": temperature,
        "top_p": 1,
        "max_tokens": max_tokens,
        "stream": False,
        "safe_prompt": False,
        "random_seed": 101,
    }

    response = requests.post(MISTRAL_URL, json=data, headers=headers)

    if response.status_code == 200:
        res = response.json()
        return res["choices"][0]["message"]["content"]
    else:
        print("Error:", response.status_code)
        print("Response:", response.text)
        return None


if __name__ == "__main__":
    example_prompt = """
    YOu are given a sentence that are recognized by a sign language interpreter.
    Use pronouns, adverbs to complete the sentence, or rearrange the words and make something that makes sense. 
    Do not include any other information in the output and return only one sentence.

    Sentence: apple green like food
    Answer:"""
    result = call_mistral_api(example_prompt)
    print(result)
