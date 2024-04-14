import uvicorn
import os
from get_secrets import PORT, ENV
from config import LOGS_DIR

def create_log_file():
    os.makedirs(LOGS_DIR, exist_ok=True)
    
def main():
    create_log_file()
    if ENV == "dev":
        uvicorn.run("api.server:app", host="0.0.0.0", port=PORT, reload=True)
    elif ENV == "prod":
        uvicorn.run("api.server:app", host="0.0.0.0", port=PORT)
    else:
        print("Invalid environment. Please set the ENV variable to 'dev' or 'prod'.")
                        

if __name__ == "__main__":
    main()    