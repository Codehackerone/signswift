import json


def read_json_file(file_path: str) -> dict:
    """Reads a JSON file and parses it into a Python object.

    Args:
        file_path: The path to the JSON file to read.

    Returns:
        A dictionary object representing the JSON data.

    Raises:
        FileNotFoundError: If the specified file path does not exist.
        ValueError: If the specified file path does not contain valid JSON data.
    """
    try:
        with open(file_path, "r") as file:
            json_data = json.load(file)
        return json_data
    except FileNotFoundError as e:
        raise FileNotFoundError(f"File not found: {file_path}") from e
    except ValueError as e:
        raise ValueError(f"Invalid JSON data in file: {file_path}") from e
