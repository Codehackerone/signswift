from typing import Any, Callable, Dict
from api.utils.error import ErrorMessage
from api.utils.exception import ApiException
from api.utils.success import SuccessMessage
from fastapi.responses import JSONResponse
import traceback


def MessageWrapper(func: Callable[..., Any]) -> Callable[..., Dict[str, Any]]:
    """
    A decorator that wraps the given function and returns a dictionary containing the response data.

    Args:
        func (Callable): The function to be wrapped.

    Returns:
        Callable: The wrapped function.

    """
    def wrapper(*args: Any, **kwargs: Any) -> Dict[str, Any]:
        """
        The wrapper function that handles exceptions and returns the response data.

        Args:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            JSONResponse: The response data.

        """
        try:
            response_data = func(*args, **kwargs)            
            
            if not isinstance(response_data, SuccessMessage):                
                response_data = SuccessMessage(data=response_data)
        
        except ApiException as e:    
            traceback.print_exc()                    
            response_data = ErrorMessage(e.message, e.status_code, **e.to_dict())
        except Exception as e:
            traceback.print_exc()
            response_data = ErrorMessage(str(e), 500)
        finally:
            response = response_data.to_dict()
            return JSONResponse(content=response, status_code=response_data.status_code)
        
    return wrapper