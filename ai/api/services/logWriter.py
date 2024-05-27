from collections import deque


class LogWriter:
    def __init__(self, max_size=100):
        self.max_size = max_size
        self.logs = deque(maxlen=max_size)

    def add_log(self, log_type, message):
        self.logs.append({"type": log_type, "message": message})

    def get_logs(self):
        return list(self.logs)
