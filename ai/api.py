import uvicorn
import os
from get_secrets import PORT, ENV
from config import LOGS_DIR
from utils.mistral_api import MistralAPI

"""
This module provides the API functionality for the SignSwift application.
"""


def create_log_file():
    """
    Creates the log file directory if it doesn't exist.
    """
    os.makedirs(LOGS_DIR, exist_ok=True)


def main():
    """
    The main function of the API.
    """
    create_log_file()
    mistral_health = MistralAPI().health_check()
    if not mistral_health:
        print("Mistral API is not healthy. Exiting...")
        return
    else:
        print("[INFO]: Mistral API is healthy.")
    if ENV == "dev":
        uvicorn.run("api.server:app", host="0.0.0.0", port=PORT, reload=True)
    elif ENV == "prod":
        uvicorn.run("api.server:app", host="0.0.0.0", port=PORT)
    else:
        print("Invalid environment. Please set the ENV variable to 'dev' or 'prod'.")


if __name__ == "__main__":
    main()
