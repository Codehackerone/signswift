from typing import Any, Dict


class ApiException(Exception):
    """
    A custom exception class to handle specific errors in the application.

    Attributes:
        message (str): The error message.
        code (int): The HTTP status code associated with the error.
    """

    def __init__(
        self, message: str = "An error occurred.", status_code: int = 500, **kwargs
    ):
        """
        Initialize the custom exception with a message and an optional error code.

        Args:
            message (str, optional): The error message. Defaults to "An error occurred."
            code (int, optional): The HTTP status code associated with the error. Defaults to 500.
            **kwargs: Additional keyword arguments to store custom attributes.
        """
        self.message = message
        self.status_code = status_code

        for key, value in kwargs.items():
            setattr(self, key, value)
        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        """
        Return a dictionary representation of the exception.

        Returns:
            dict: A dictionary representation of the exception.
        """

        result = self.__dict__.copy()

        for key, value in result.items():
            if isinstance(value, ApiException):
                result[key] = value.to_dict()

        return result


if __name__ == "__main__":
    try:
        raise ApiException(
            "An error occurred.",
            500,
            details="Additional details.",
            more_info="https://example.com",
        )
    except ApiException as e:
        print(e.to_dict())
