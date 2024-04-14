from dotenv import dotenv_values

# Load variables from the .env file
env_vars = dotenv_values(".env")

MISTRAL_URL = env_vars.get("MISTRAL_URL")
PORT = int(env_vars.get("PORT"))
ENV = env_vars.get("ENV")
VERSION = env_vars.get("VERSION")