import mediapipe as mp
import cv2
import asyncio
import numpy as np
import pandas as pd
from models.model import Model
from config import FILE_PATH, PROMPT, NUMBER_OF_FRAMES
from utils.mistral_api import MistralAPI
from typing import Tuple, List, Dict, Union
import os
from moviepy.editor import VideoFileClip
from api.dto.prediction import Prediction
from api.dto.landmark import LandMark
from api.utils.exception import ApiException
from api.services.logWriter import LogWriter


class VideoPrediction:
    mp_holistic = mp.solutions.holistic  # Holistic model
    mp_drawing = mp.solutions.drawing_utils  # Drawing utilities

    holistic = mp_holistic.Holistic(
        min_detection_confidence=0.5, min_tracking_confidence=0.5
    )

    @classmethod
    def mediapipe_detection(
        self, image: np.ndarray, model: mp.solutions.holistic.Holistic
    ) -> Tuple[np.ndarray, mp.solutions.holistic.Holistic]:
        """
        Perform mediapipe detection on an image using the given model.

        Args:
            image (np.ndarray): The input image.
            model (mp.solutions.holistic.Holistic): The mediapipe holistic model.

        Returns:
            Tuple[np.ndarray, mp.solutions.holistic.Holistic]: The processed image and the detection results.
        """
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = model.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        return image, results

    def draw_styled_landmarks(
        self, image: np.ndarray, results: mp.solutions.holistic.Holistic
    ) -> None:
        """
        Draw styled landmarks on the image.

        Args:
            image (np.ndarray): The input image.
            results (mp.solutions.holistic.Holistic): The detection results.
        """
        self.mp_drawing.draw_landmarks(
            image,
            results.face_landmarks,
            self.mp_holistic.FACEMESH_TESSELATION,
            self.mp_drawing.DrawingSpec(
                color=(80, 110, 10), thickness=1, circle_radius=1
            ),
            self.mp_drawing.DrawingSpec(
                color=(80, 256, 121), thickness=1, circle_radius=1
            ),
        )
        self.mp_drawing.draw_landmarks(
            image,
            results.pose_landmarks,
            self.mp_holistic.POSE_CONNECTIONS,
            self.mp_drawing.DrawingSpec(
                color=(80, 22, 10), thickness=2, circle_radius=4
            ),
            self.mp_drawing.DrawingSpec(
                color=(80, 44, 121), thickness=2, circle_radius=2
            ),
        )
        self.mp_drawing.draw_landmarks(
            image,
            results.left_hand_landmarks,
            self.mp_holistic.HAND_CONNECTIONS,
            self.mp_drawing.DrawingSpec(
                color=(121, 22, 76), thickness=2, circle_radius=4
            ),
            self.mp_drawing.DrawingSpec(
                color=(121, 44, 250), thickness=2, circle_radius=2
            ),
        )
        self.mp_drawing.draw_landmarks(
            image,
            results.right_hand_landmarks,
            self.mp_holistic.HAND_CONNECTIONS,
            self.mp_drawing.DrawingSpec(
                color=(245, 117, 66), thickness=2, circle_radius=4
            ),
            self.mp_drawing.DrawingSpec(
                color=(245, 66, 230), thickness=2, circle_radius=2
            ),
        )

    def extract_keypoints(
        self, frame_id: str, results: mp.solutions.holistic.Holistic
    ) -> List[Dict[str, Union[str, float]]]:
        """
        Extract keypoints from the detection results.

        Args:
            frame_id (str): The frame ID.
            results (mp.solutions.holistic.Holistic): The detection results.

        Returns:
            List[Dict[str, Union[str, float]]]: The extracted keypoints.
        """
        objects = []

        # FACE
        if results.face_landmarks:
            for i, res in enumerate(results.face_landmarks.landmark):
                objects.append(
                    LandMark().add(
                        x=res.x,
                        y=res.y,
                        z=res.z,
                        frame=frame_id,
                        type="face",
                        landmark_index=i,
                    )
                )
        else:
            for i in range(468):
                objects.append(
                    LandMark().add(
                        x=np.nan,
                        y=np.nan,
                        z=np.nan,
                        frame=frame_id,
                        type="face",
                        landmark_index=i,
                    )
                )

        # LEFT
        if results.left_hand_landmarks:
            for i, res in enumerate(results.left_hand_landmarks.landmark):
                objects.append(
                    LandMark().add(
                        x=res.x,
                        y=res.y,
                        z=res.z,
                        frame=frame_id,
                        type="left",
                        landmark_index=i,
                    )
                )
        else:
            for i in range(21):
                objects.append(
                    LandMark().add(
                        x=np.nan,
                        y=np.nan,
                        z=np.nan,
                        frame=frame_id,
                        type="left",
                        landmark_index=i,
                    )
                )

        # POSE
        if results.pose_landmarks:
            for i, res in enumerate(results.pose_landmarks.landmark):
                objects.append(
                    LandMark().add(
                        x=res.x,
                        y=res.y,
                        z=res.z,
                        frame=frame_id,
                        type="pose",
                        landmark_index=i,
                    )
                )
        else:
            for i in range(33):
                objects.append(
                    LandMark().add(
                        x=np.nan,
                        y=np.nan,
                        z=np.nan,
                        frame=frame_id,
                        type="pose",
                        landmark_index=i,
                    )
                )

        # RIGHT
        if results.right_hand_landmarks:
            for i, res in enumerate(results.right_hand_landmarks.landmark):
                objects.append(
                    LandMark().add(
                        x=res.x,
                        y=res.y,
                        z=res.z,
                        frame=frame_id,
                        type="right",
                        landmark_index=i,
                    )
                )
        else:
            for i in range(21):
                objects.append(
                    LandMark().add(
                        x=np.nan,
                        y=np.nan,
                        z=np.nan,
                        frame=frame_id,
                        type="right",
                        landmark_index=i,
                    )
                )

        return objects

    def delete_file(self, file_path: str) -> None:
        """
        Delete a file.

        Args:
            file_path (str): The path of the file to be deleted.
        """
        os.remove(file_path)

    async def convert_avi_to_mp4(self, input_file: str, output_file: str) -> None:
        """
        Convert an AVI video file to MP4 format.

        Args:
            input_file (str): The path of the input AVI file.
            output_file (str): The path of the output MP4 file.
        """
        video = VideoFileClip(input_file)
        video.write_videofile(output_file, codec="libx264")

    def get_current_duration(self, fps: float, frame_id: int) -> float:
        """
        Calculate the current duration based on the frame ID and FPS.

        Args:
            fps (float): The frames per second of the video.
            frame_id (int): The current frame ID.

        Returns:
            float: The current duration in seconds.
        """
        current_duration = frame_id / fps
        return current_duration

    async def predict_video(
        self,
        mistral: MistralAPI,
        model: Model,
        video_path: str,
        output_path: str,
        log_writer: LogWriter,
    ) -> Tuple[List[Dict[str, Union[str, float]]], List[str]]:
        """
        Predict the sign language gestures in a video.

        Args:
            mistral (MistralAPI): The MistralAPI instance.
            model (Model): The sign language gesture recognition model.
            video_path (str): The path of the input video.
            output_path (str): The path to save the output video.
            log_writer (LogWriter): The log writer instance.

        Returns:
            Tuple[List[Dict[str, Union[str, float]]], List[str]]: The predictions and the generated sentence.
        """
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_width = int(cap.get(3))
        frame_height = int(cap.get(4))

        fourcc = cv2.VideoWriter_fourcc(*"XVID")
        out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

        sequence = []
        predictions = []
        sentence = []
        frame_id = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            image, results = self.mediapipe_detection(frame, self.holistic)
            self.draw_styled_landmarks(image, results)
            if len(sequence) < NUMBER_OF_FRAMES:
                sequence.append(self.extract_keypoints(str(frame_id), results))
            elif len(sequence) == NUMBER_OF_FRAMES:
                seq_pred = []
                for s in sequence:
                    seq_pred.extend(s)
                seq_pred = [s.to_dict() for s in seq_pred]
                df = pd.DataFrame(seq_pred)
                df_imp = df.drop(["frame", "type", "landmark_index"], axis=1)

                print("[INFO]: Predicting")
                log_writer.add_log("info", "Predicting")
                prediction, max_prob = model.predict(df_imp)

                #   if max_prob < MIN_THRESHOLD:
                #       pass
                #   else:
                # Remove repeated words
                if len(predictions) > 0 and prediction == predictions[-1].word:
                    # if max_prob > predictions[-1].probability:
                    #     predictions[-1]["probability"] = str(max_prob)
                    pass
                else:
                    sentence.append(prediction)
                    llm_prediction = (
                        mistral.call_mistral_api(PROMPT(" ".join(sentence)))
                        if len(sentence) > 2
                        else ""
                    )
                    prediction_obj = Prediction().add(
                        word=prediction,
                        probability=max_prob,
                        current_duration=round(
                            self.get_current_duration(fps, frame_id)
                        ),
                        sentence_till_now=str(" ".join(sentence)),
                        llm_prediction=str(llm_prediction),
                    )
                    predictions.append(prediction_obj)
                sequence = []
            out.write(image)
            frame_id += 1

        cap.release()
        out.release()

        predictions = [p.to_dict() for p in predictions]

        return predictions, sentence

    async def main(
        self,
        mistral: MistralAPI,
        model: Model,
        video_path: str,
        save_name: str,
        log_writer: LogWriter,
    ) -> None:
        """
        Perform sign language gesture prediction on a video.

        Args:
            mistral (MistralAPI): The MistralAPI instance.
            model (Model): The sign language gesture recognition model.
            video_path (str): The path of the input video.
            save_name (str): The name to be used for saving the output files.
            log_writer (LogWriter): The log writer instance.
        """
        try:
            video_save_path_avi = f"{FILE_PATH}/api/dump/{save_name}_processed.avi"
            video_save_path_mp4 = f"{FILE_PATH}/api/dump/{save_name}_processed.mp4"
            predictions, sentence = await self.predict_video(
                mistral=mistral,
                model=model,
                video_path=video_path,
                output_path=video_save_path_avi,
                log_writer=log_writer,
            )
            await self.convert_avi_to_mp4(
                input_file=video_save_path_avi, output_file=video_save_path_mp4
            )
            self.delete_file(video_save_path_avi)

            return predictions, sentence, video_save_path_mp4
        except Exception as e:
            raise ApiException(
                message="Failed to predict sign language gestures in the video.",
                status_code=501,
                details=str(e),
            )


if __name__ == "__main__":
    model = Model(
        model_path=FILE_PATH + "/weights/islr-fp16-192-8-seed42-foldall-last.h5"
    )
    model.__load__()
    video_path = FILE_PATH + "/videos/APPLE GREEN YOU LIKE EAT.mp4"
    save_name = "apple"
    asyncio.run(VideoPrediction().main(model, video_path, save_name))
