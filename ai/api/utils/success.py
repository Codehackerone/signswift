from typing import Optional, Any, Dict
from config import STATUS_CODES


class SuccessMessage:
    """
    Represents a success message with optional data.
    """

    def __init__(
        self,
        message: str = "Success",
        status_code: int = 200,
        data: Optional[Dict[str, Any]] = None,
        **kwargs: Any
    ):
        """
        Initialize the SuccessMessage with a message and optional data.

        Args:
          message (str, optional): The success message. Defaults to "Success".
          status_code (int, optional): The HTTP status code. Defaults to 200.
          data (Dict[str, Any], optional): Optional data associated with the success. Defaults to None.
          **kwargs: Additional key-value pairs to be stored as attributes.
        """
        self.message = message
        self.data = data
        self.status_code = status_code
        self.status_message = STATUS_CODES.get(status_code, "Unknown")

        for key, value in kwargs.items():
            setattr(self, key, value)

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the success message and data to a dictionary.

        Returns:
          dict: A dictionary representation of the success message and data.
        """
        result = self.__dict__.copy()

        for key, value in result.items():
            if isinstance(value, SuccessMessage):
                result[key] = value.to_dict()

        return result


if __name__ == "__main__":
    try:
        success = SuccessMessage(
            "Success",
            200,
            details="Additional details.",
            more_info="https://example.com",
        )
        print(success.to_dict())
    except Exception as e:
        print(e)
