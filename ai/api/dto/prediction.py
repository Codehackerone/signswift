from typing import Any, Dict


class Prediction:
    """
    Represents a prediction for a word in a sentence.
    """

    def __init__(self) -> None:
        """
        Initializes a new instance of the Prediction class.
        """
        self.word: str = None
        self.probability: float = None
        self.current_duration: int = None
        self.sentence_till_now: str = None
        self.llm_prediction: str = None

    def add(
        self,
        word: str,
        probability: float,
        current_duration: int,
        sentence_till_now: str,
        llm_prediction: str,
    ) -> "Prediction":
        """
        Adds a prediction to the instance.

        Args:
            word (str): The predicted word.
            probability (float): The probability of the prediction.
            current_duration (int): The current duration of the sentence.
            sentence_till_now (str): The sentence formed till now.
            llm_prediction (str): The prediction from the language model.

        Returns:
            Prediction: The updated instance of Prediction.
        """
        self.word = word
        self.probability = probability
        self.current_duration = current_duration
        self.sentence_till_now = sentence_till_now
        self.llm_prediction = llm_prediction

        return self

    def to_dict(self) -> Dict[str, Any]:
        """
        Converts the instance to a dictionary.

        Returns:
            Dict[str, Any]: The dictionary representation of the instance.
        """
        return {
            "word": self.word,
            "probability": str(self.probability),
            "current_duration": str(self.current_duration),
            "sentence_till_now": str(self.sentence_till_now),
            "llm_prediction": str(self.llm_prediction),
        }
