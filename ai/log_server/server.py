# secondary_server.py

from flask import Flask, jsonify, send_from_directory
import requests
import threading
import time
import os

app = Flask(__name__)

# URL of the primary server's logs endpoint
PRIMARY_SERVER_LOGS_URL = "http://localhost:8769/logs"

# In-memory storage for fetched logs
fetched_logs = []


def fetch_logs():
    global fetched_logs
    while True:
        try:
            response = requests.get(PRIMARY_SERVER_LOGS_URL)
            if response.status_code == 200:
                fetched_logs = response.json()
            else:
                print(f"Failed to fetch logs: {response.status_code}")
        except requests.RequestException as e:
            fetched_logs = {"content": []}
            print(f"Error fetching logs: {e}")
        time.sleep(0.5)


@app.route("/display-logs", methods=["GET"])
def display_logs():
    return jsonify(fetched_logs)


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


if __name__ == "__main__":
    # Start the log fetching thread
    fetch_thread = threading.Thread(target=fetch_logs)
    fetch_thread.daemon = True
    fetch_thread.start()

    # Start the Flask server
    app.run(port=5001, debug=True)
