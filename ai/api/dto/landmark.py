from typing import Any, Dict


class LandMark:
    def __init__(self) -> None:
        """
        Initialize the LandMark object.
        """
        self.x: float = 0.0
        self.y: float = 0.0
        self.z: float = 0.0
        self.frame: int = 0
        self.type: str = ""
        self.landmark_index: int = 0

    def add(
        self, x: float, y: float, z: float, frame: int, type: str, landmark_index: int
    ) -> "LandMark":
        """
        Add values to the LandMark object.

        Args:
            x (float): The x-coordinate.
            y (float): The y-coordinate.
            z (float): The z-coordinate.
            frame (int): The frame number.
            type (str): The type of landmark.
            landmark_index (int): The index of the landmark.

        Returns:
            LandMark: The updated LandMark object.
        """
        self.x = x
        self.y = y
        self.z = z
        self.frame = frame
        self.type = type
        self.landmark_index = landmark_index

        return self

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the LandMark object to a dictionary.

        Returns:
            Dict[str, Any]: The dictionary representation of the LandMark object.
        """
        return {
            "x": self.x,
            "y": self.y,
            "z": self.z,
            "frame": self.frame,
            "type": self.type,
            "landmark_index": self.landmark_index,
        }
