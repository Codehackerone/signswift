from fastapi import FastAPI, Request
from api.logger import RequestLogger
from get_secrets import VERSION
from config import LOGS_DIR
from api.utils.message import MessageWrapper
from api.utils.success import SuccessMessage
from starlette.responses import Response
from api.utils.exception import ApiException
from typing import Union

# Initialize FastAPI app
app: FastAPI = FastAPI()
logger: RequestLogger = RequestLogger(f"{LOGS_DIR}/requests.log")

@app.middleware("http")
async def log_requests(request: Request, call_next) -> Response:
    """
    Middleware function to log incoming requests.
    """
    await logger.log_request(request)
    response: Response = await call_next(request)
    return response

@MessageWrapper
@app.get("/", response_model=None)
async def main() -> Union[SuccessMessage, ApiException, Exception, None]:
    """
    Main endpoint of the API.
    Returns a success message with API information.

    Returns:
        Union[SuccessMessage, ApiException, Exception, None]: The response message.
    """
    return SuccessMessage(
        message="Welcome to the SignSwift AI Backend API!",
        version=VERSION,
        description="This API provides endpoints for the SignSwift ML Backend.",
        status_code=200
    )

@MessageWrapper
@app.get("/health", response_model=None)
async def health() -> Union[SuccessMessage, ApiException, Exception, None]:
    """
    Health endpoint of the API.
    Returns a success message indicating the API is healthy.

    Returns:
        Union[SuccessMessage, ApiException, Exception, None]: The response message.
    """
    return SuccessMessage(
        message="The SignSwift AI Backend API is healthy.",
        status_code=200
    )
