from pymongo import MongoClient
from get_secrets import MONGO_URI, DB_NAME, VIDEO_COLLECTION
from api.utils.exception import ApiException
import bson
from typing import Any, Dict, Optional
from pymongo.results import UpdateResult
from pymongo.database import Database
from pymongo.collection import Collection
import pymongo


class MongoService:
    @classmethod
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self.video_collection: Optional[Collection] = None
        self.connected: bool = False

    @classmethod
    def __connect__(self) -> None:
        """
        Connects to the MongoDB database.

        Raises:
          ApiException: If failed to connect to the MongoDB database.
        """
        try:
            self.client = MongoClient(MONGO_URI)
            self.db = self.client[DB_NAME]
            self.video_collection = self.db[VIDEO_COLLECTION]
            self.connected = True
        except Exception as e:
            raise ApiException(
                message="Failed to connect to the MongoDB database.",
                status_code=500,
                details=str(e),
            )

    @classmethod
    def fetch_video(self, video_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches a video from the video collection.

        Args:
          video_id (str): The ID of the video.

        Returns:
          dict: The video data.

        Raises:
          ApiException: If failed to fetch video from the database.
        """
        try:
            video = self.video_collection.find_one({"_id": bson.ObjectId(video_id)})
            if video is None:
                raise ApiException(
                    message="Video not found in the database.", status_code=404
                )
            else:
                return video
        except pymongo.errors.OperationFailure as e:
            raise ApiException(
                message="Video not found in the database.",
                status_code=404,
                details=str(e),
            )
        except Exception as e:
            raise ApiException(
                message="Failed to fetch video from the database.",
                status_code=500,
                details=str(e),
            )

    @classmethod
    def fetch_videos_by_status(self, status: str) -> Optional[Dict[str, Any]]:
        """
        Fetches videos from the video collection by status.

        Args:
          status (str): The status of the video.

        Returns:
          dict: The video data.

        Raises:
          ApiException: If failed to fetch videos from the database.
        """
        try:
            return self.video_collection.find({"status": status}).sort(
                "created_at", pymongo.ASCENDING
            )
        except Exception as e:
            raise ApiException(
                message="Failed to fetch videos from the database.",
                status_code=500,
                details=str(e),
            )

    @classmethod
    def update_video_status(self, video_id: str, status: str) -> Optional[UpdateResult]:
        """
        Updates the status of the video in the video collection.

        Args:
          video_id (str): The ID of the video.
          status (str): The status of the video.

        Returns:
          UpdateResult: The result of the update operation.

        Raises:
          ApiException: If failed to update video in the database.
        """
        try:
            return self.video_collection.update_one(
                {"_id": bson.ObjectId(video_id)}, {"$set": {"status": status}}
            )
        except bson.errors.InvalidId as e:
            raise ApiException(
                message="Invalid video ID.", status_code=400, details=str(e)
            )
        except pymongo.errors.OperationFailure as e:
            raise ApiException(
                message="Video not found in the database.",
                status_code=404,
                details=str(e),
            )
        except pymongo.errors.PyMongoError as e:
            raise ApiException(
                message="Failed to update video in the database.",
                status_code=401,
                details=str(e),
            )
        except Exception as e:
            raise ApiException(
                message="Failed to update video in the database.",
                status_code=401,
                details=str(e),
            )

    @classmethod
    def update_collection(
        self, video_id: str, processed_data: Dict[str, Any], processed_video_uri: str
    ) -> Optional[UpdateResult]:
        """
        Updates the video collection with the processed data and video URI.

        Args:
          video_id (str): The ID of the video.
          processed_data (dict): The processed data of the video.
          processed_video_uri (str): The URI of the processed video.

        Returns:
          UpdateResult: The result of the update operation.

        Raises:
          ApiException: If failed to update video in the database.
        """
        try:
            return self.video_collection.update_one(
                {"_id": bson.ObjectId(video_id)},
                {
                    "$set": {
                        "processed_data": processed_data,
                        "processed_video_uri": processed_video_uri,
                        "status": "processed",
                    }
                },
            )

        except pymongo.errors.OperationFailure as e:
            raise ApiException(
                message="Video couldnt be updated", status_code=404, details=str(e)
            )
        except pymongo.errors.PyMongoError as e:
            raise ApiException(
                message="Failed to update video in the database.",
                status_code=401,
                details=str(e),
            )
        except Exception as e:
            raise ApiException(
                message="Failed to update video in the database.",
                status_code=500,
                details=str(e),
            )


if __name__ == "__main__":
    try:
        try:
            mongo_service = MongoService()
            mongo_service.__connect__()
            video = mongo_service.fetch_video("661bb9bf31f202b911c9cc6ds")
            print(video)
        except ApiException as e:
            # print(e.to_dict())
            raise e
    except ApiException as e:
        raise e
