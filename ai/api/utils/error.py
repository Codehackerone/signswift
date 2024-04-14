from typing import Optional, Any, Dict
from config import STATUS_CODES

class ErrorMessage:
  """
  Represents an error message with optional data.
  """

  def __init__(self, message: str = "Error", status_code: int = 400, data: Optional[Dict[str, Any]] = None, **kwargs: Any):
    """
    Initialize the ErrorMessage with a message and optional data.

    Args:
      message (str, optional): The error message. Defaults to "Error".
      status_code (int, optional): The HTTP status code. Defaults to 400.
      data (Dict[str, Any], optional): Optional data associated with the error. Defaults to None.
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
      if isinstance(value, ErrorMessage):
        result[key] = value.to_dict()
        
    return result

if __name__ == "__main__":
  try:
    error = ErrorMessage("An error occurred.", 500, details="Additional details.", more_info="https://example.com")
    print(error.to_dict())
  except Exception as e:
    print(e)