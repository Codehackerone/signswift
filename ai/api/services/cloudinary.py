import requests
from config import FILE_PATH
from get_secrets import CLOUD_NAME, API_KEY, API_SECRET
from api.utils.exception import ApiException
from utils.utils import generate_random_string
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api

cloudinary.config(
    secure=True, api_key=API_KEY, api_secret=API_SECRET, cloud_name=CLOUD_NAME
)


class CloudinaryService:
    @classmethod
    def __init__(self, video_url: str, save_name: str) -> None:
        """
        Initialize the CloudinaryService class.

        Args:
          video_url (str): The URL of the video to download.
          save_name (str): The name to save the downloaded video as.
        """
        self.video_url = video_url
        self.save_path = f"{FILE_PATH}/api/dump/{save_name}.mp4"
        self.finished_download = False
        self.finished_upload = False
        self.upload_path = None

    @classmethod
    def download_video(self) -> str:
        """
        Download the video from the specified URL and save it to the specified path.

        Returns:
          str: The path where the video is saved.

        Raises:
          ApiException: If there is an error while downloading the video.
        """
        try:
            with requests.get(self.video_url, stream=True) as response:
                response.raise_for_status()
                with open(self.save_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
            print(f"Video downloaded successfully to: {self.save_path}")
            self.finished_download = True

            return self.save_path
        except requests.exceptions.RequestException as e:
            raise ApiException(
                message=f"Failed to download video from URL: {self.video_url}",
                status_code=500,
                exception=e,
            )
        except Exception as e:
            raise ApiException(
                message="Something went wrong while downloading the video.",
                status_code=500,
                exception=e,
            )

    @classmethod
    def cleanup(self) -> None:
        """
        Clean up the downloaded video file if it has been successfully downloaded.
        """
        if self.finished_download and os.path.exists(self.save_path):
            os.remove(self.save_path)
        if self.finished_upload and os.path.exists(self.upload_path):
            os.remove(self.upload_path)

    @classmethod
    def upload_video(self, file_path: str) -> str:
        """
        Upload the video to a cloud storage service.

        Args:
          file_path (str): The path of the video file to upload.

        Returns:
          str: The secure URL of the uploaded video.

        Raises:
          ApiException: If the file is not found or there is an error while uploading the video.
        """
        if not os.path.exists(file_path):
            raise ApiException(
                message=f"File not found: {file_path}",
                status_code=404,
            )

        try:
            response = cloudinary.uploader.upload_large(
                file_path,
                public_id=generate_random_string(10),
                unique_filename=False,
                overwrite=True,
            )
            self.upload_path = file_path
            self.finished_upload = True
            return response.get("secure_url")
        except Exception as e:
            raise ApiException(
                message="Failed to upload video to cloud storage.",
                status_code=500,
                exception=e,
            )


if __name__ == "__main__":
    # Example usage:
    video_url = "https://res.cloudinary.com/dw6db3mad/video/upload/v1712740312/Test/rqjoiqfahkv27d9zuxei.mp4"
    save_name = "video"
    cloudinary_service = CloudinaryService(video_url, save_name)
    # path = cloudinary_service.download_video()
    # print(path)
    cloudinary_url = cloudinary_service.upload_video(FILE_PATH + "/api/dump/video.mp4")
    print(cloudinary_url)
