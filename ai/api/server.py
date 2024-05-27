from fastapi import FastAPI, Request
from api.logger import RequestLogger
from get_secrets import VERSION
from config import LOGS_DIR
from api.utils.message import MessageWrapper
from api.utils.success import SuccessMessage
from api.utils.error import ErrorMessage
from starlette.responses import Response
from api.utils.exception import ApiException
from api.services.queue import QueueService
from api.dto.request import AddQueue
from api.services.logWriter import LogWriter
from typing import Union
import warnings
from aiocron import crontab
import asyncio
import threading

warnings.filterwarnings("ignore")
# Initialize FastAPI app
app: FastAPI = FastAPI(
    swagger_ui_parameters={
        "syntaxHighlight": False,
        "syntaxHighlight.theme": "obsidian",
    }
)
logger: RequestLogger = RequestLogger(f"{LOGS_DIR}/requests.log")
queue: QueueService = QueueService()
semaphore = asyncio.Semaphore(1)
log_writer = LogWriter(max_size=1000)


async def cron_service() -> None:
    """
    Function to run the queue service.
    """
    global semaphore

    if semaphore.locked():
        return
    if queue:
        async with semaphore:
            await queue.task(log_writer)


def run_cron_service() -> None:
    asyncio.run(cron_service())


@crontab("* * * * *")
def schedule_cron_service() -> None:
    """
    Schedule the cron_service function to run every minute.
    """
    threading.Thread(target=run_cron_service).start()


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
async def main() -> Union[SuccessMessage, ApiException, ErrorMessage, Exception, None]:
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
        status_code=200,
    )


@MessageWrapper
@app.get("/health", response_model=None)
async def health() -> (
    Union[SuccessMessage, ApiException, ErrorMessage, Exception, None]
):
    """
    Health endpoint of the API.
    Returns a success message indicating the API is healthy.

    Returns:
        Union[SuccessMessage, ApiException, Exception, None]: The response message.
    """
    return SuccessMessage(
        message="The SignSwift AI Backend API is healthy.", status_code=200
    )


@MessageWrapper
@app.get("/logs", response_model=None)
async def get_logs() -> (
    Union[SuccessMessage, ApiException, ErrorMessage, Exception, None]
):
    """
    Endpoint to get the logs from the log writer.

    Returns:
        Union[SuccessMessage, ApiException, ErrorMessage, Exception, None]: The response message.
    """
    try:
        logs = log_writer.get_logs()
        return SuccessMessage(
            message="Logs fetched successfully.", content=logs, status_code=200
        )
    except Exception as e:
        return ErrorMessage(
            message="Failed to fetch logs.", status_code=500, details=str(e)
        )


@MessageWrapper
@app.post("/queue/add", response_model=None)
async def add_to_queue(
    request: AddQueue,
) -> Union[SuccessMessage, ErrorMessage, ApiException, Exception, None]:
    """
    Endpoint to add a video to the queue.

    Args:
        request (AddQueue): The request object.

    Returns:
        Union[SuccessMessage, ErrorMessage, ApiException, Exception, None]: The response message.
    """
    try:
        video_id: str = request.video_id
        position: int = queue.add_to_queue(video_id)
        return SuccessMessage(
            message="Video added to queue successfully.",
            position=position,
            status_code=200,
        )
    except ApiException as e:
        return ErrorMessage(
            message=e.message, status_code=e.status_code, details=e.details
        )
    except Exception as e:
        return ErrorMessage(
            message="Failed to add video to the queue.", status_code=500, details=str(e)
        )


@MessageWrapper
@app.get("/queue/position/{video_id}", response_model=None)
async def get_queue_position(
    video_id: str,
) -> Union[SuccessMessage, ErrorMessage, ApiException, Exception, None]:
    """
    Endpoint to get the position of a video in the queue.

    Args:
        video_id (str): The ID of the video.

    Returns:
        Union[SuccessMessage, ErrorMessage, ApiException, Exception, None]: The response message.
    """
    try:
        position: int = queue.get_video_queue_position(video_id)
        if position == -1:
            raise ApiException(
                message="Video not found in the queue.",
                status_code=404,
            )
        return SuccessMessage(
            message="Video found in the queue.",
            content=f"Video found at position: {position}",
            status_code=200,
        )
    except ApiException as e:
        return ErrorMessage(
            message=e.message, status_code=e.status_code, details=e.details
        )
    except Exception as e:
        return ErrorMessage(
            message="Failed to get video queue position.",
            status_code=500,
            details=str(e),
        )
