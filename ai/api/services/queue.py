from api.dto.video import QueueVideo
import asyncio
from typing import Optional
from api.services.mongo import MongoService
from api.services.cloudinary import CloudinaryService
from api.utils.exception import ApiException
from config import FILE_PATH
from models.model import Model
from api.video import VideoPrediction
from utils.mistral_api import MistralAPI


class QueueService(object):
    @classmethod
    def __init__(self) -> None:
        self.semaphore = asyncio.Semaphore(1)
        self.queue: Optional[QueueVideo] = []
        mongo_service = MongoService()
        mongo_service.__connect__()
        self.mongo_service = mongo_service
        self.model = Model(
            model_path=FILE_PATH + "/weights/islr-fp16-192-8-seed42-foldall-last.h5"
        )
        self.model.__load__()
        self.video_prediction = VideoPrediction()
        self.mistral = MistralAPI()
        self.mistral.health_check()
        self.__load_queue()

    @classmethod
    def __load_queue(self) -> None:
        """
        Loads the queue from the database.
        """
        videos = self.mongo_service.fetch_videos_by_status("queued")
        self.queue.extend(
            [QueueVideo().start(str(video["_id"]), video["url"]) for video in videos]
        )
        print(f"Loaded {len(self.queue)} videos from the database.")

    @classmethod
    def add_to_queue(self, video_id: str) -> int:
        """
        Adds a video to the queue.

        Args:
          video_id (str): The ID of the video.
          video_url (str): The URL of the video.
        """
        try:
            video = self.mongo_service.fetch_video(video_id)
            position = self.get_video_queue_position(video_id)
            if position != -1:
                return position
            self.queue.append(QueueVideo().start(video_id, video["url"]))
            # asyncio.create_task(self.task())
            return len(self.queue)
        except ApiException as e:
            raise e
        except Exception as e:
            raise ApiException(
                message="Failed to add video to the queue.",
                status_code=500,
                details=str(e),
            )

    @classmethod
    def get_video_queue_position(self, video_id: str) -> int:
        """
        Gets the position of the video in the queue.

        Args:
          video_id (str): The ID of the video.

        Returns:
          int: The position of the video in the queue.
        """
        for i, video in enumerate(self.queue):
            if video.video_id == video_id:
                return i
        return -1

    @classmethod
    async def task(self, log_writer) -> None:
        print("Running task.")
        if len(self.queue) == 0:
            log_writer.add_log("info", "No videos in the queue.")
            print("No videos in the queue.")
            self.__load_queue()
            return

        if self.semaphore.locked():
            print("Task already running.")
            return

        self.semaphore.acquire()

        video = self.queue[0]
        try:
            # Download the Video from Cloduinary
            print(f"Start processing video: {video.video_id}")
            log_writer.add_log("info", f"Start processing video: {video.video_id}")

            print(f"Dowloading video from {video.url}")
            log_writer.add_log("info", f"Dowloading video from {video.url}")
            cloudinary_service = CloudinaryService(video.url, video.video_id)
            path = cloudinary_service.download_video()

            print(f"Downloaded video to {path}")
            log_writer.add_log("info", f"Downloaded video to {path}")
            print(f"Processing video {video.video_id}")
            log_writer.add_log("info", f"Processing video {video.video_id}")
            # Process the Video
            predictions, sentence, video_save_path_mp4 = (
                await self.video_prediction.main(
                    mistral=self.mistral,
                    model=self.model,
                    video_path=path,
                    save_name=video.video_id,
                    log_writer=log_writer,
                )
            )
            print(f"Processed video {video.video_id}")
            log_writer.add_log("info", f"Processed video {video.video_id}")
            print(f"Starting upload to Cloudinary.")
            log_writer.add_log("info", f"Starting upload to Cloudinary.")
            # Upload the Video to Cloudinary
            upload_path = cloudinary_service.upload_video(video_save_path_mp4)

            print("Updating mongoDB")
            log_writer.add_log("info", "Updating mongoDB")
            # Update the Video Status
            self.mongo_service.update_collection(
                video_id=video.video_id,
                processed_data=predictions,
                processed_video_uri=upload_path,
            )

            # Delete files
            cloudinary_service.cleanup()

            print(f"Finished processing video: {video.video_id}")
            log_writer.add_log("info", f"Finished processing video: {video.video_id}")
        except ApiException as e:
            self.mongo_service.update_video_status(video.video_id, "failed")
            log_writer.add_log(
                "error", f"Failed to process video: {video.video_id}\n {str(e)}"
            )
            raise e
        except Exception as e:
            self.mongo_service.update_video_status(video.video_id, "failed")
            log_writer.add_log(
                "error", f"Failed to process video: {video.video_id}\n {str(e)}"
            )
            raise ApiException(
                message="Failed to process video.", status_code=500, details=str(e)
            )
        finally:
            self.queue.pop(0)
            self.semaphore.release()
