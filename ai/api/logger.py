import logging
from fastapi import Request


class RequestLogger:
    def __init__(self, log_file: str) -> None:
        """
        Initializes the RequestLogger class.

        Args:
            log_file (str): The path to the log file.
        """
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

    async def log_request(self, request: Request) -> None:
        """
        Logs the details of the incoming request.

        Args:
            request (Request): The incoming request object.
        """
        client_ip: str = request.client.host
        method: str = request.method
        url: str = request.url.path
        query_params: dict = dict(request.query_params)
        headers: dict = dict(request.headers)
        body: bytes = None

        # Check if the request has a body
        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            body = await request.body()

        log_message: str = (
            f"Request: {method} {url} | IP: {client_ip} | Query params: {query_params} | Headers: {headers} | Body: {body}"
        )
        self.logger.info(log_message)
