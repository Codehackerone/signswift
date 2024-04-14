from dotenv import dotenv_values

# Load variables from the .env file
env_vars = dotenv_values(".env")

MISTRAL_URL = env_vars.get("MISTRAL_URL")
PORT = int(env_vars.get("PORT"))
ENV = env_vars.get("ENV")
VERSION = env_vars.get("VERSION")
CLOUDINARY_FOLDER = env_vars.get("CLOUDINARY_FOLDER")
CLOUD_NAME = env_vars.get("CLOUD_NAME")
API_KEY = env_vars.get("API_KEY")
API_SECRET = env_vars.get("API_SECRET")
MONGO_URI = env_vars.get("MONGO_URI")
DB_NAME = env_vars.get("DB_NAME")
VIDEO_COLLECTION = env_vars.get("VIDEO_COLLECTION")
