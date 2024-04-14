from pydantic import BaseModel


class AddQueue(BaseModel):
    video_id: str
