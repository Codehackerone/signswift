import datetime


class QueueVideo:
    """
    Represents a video in the queue.
    """

    def __init__(self) -> None:
        """
        Initializes a new instance of the QueueVideo class.
        """
        self.video_id: str = ""
        self.url: str = ""
        self.completed: bool = False
        self.created_at: str = ""
        self.completed_at: str = ""
        self.error: bool = False
        self.error_message: str = ""

    def start(self, video_id: str, url: str) -> "QueueVideo":
        """
        Starts processing the video.

        Args:
            video_id (str): The ID of the video.
            url (str): The URL of the video.

        Returns:
            QueueVideo: The current instance of the QueueVideo class.
        """
        self.video_id = video_id
        self.url = url
        self.created_at = datetime.datetime.now().isoformat()

        return self

    def complete(self) -> "QueueVideo":
        """
        Marks the video as completed.

        Returns:
            QueueVideo: The current instance of the QueueVideo class.
        """
        self.completed = True
        self.completed_at = datetime.datetime.now().isoformat()

        return self

    def exception(self, error_message: str) -> "QueueVideo":
        """
        Marks the video as an exception with the specified error message.

        Args:
            error_message (str): The error message.

        Returns:
            QueueVideo: The current instance of the QueueVideo class.
        """
        self.error = True
        self.error_message = error_message

        return self
