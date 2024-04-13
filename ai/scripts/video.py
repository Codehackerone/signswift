import mediapipe as mp
import cv2
import json
import numpy as np
import pandas as pd
from models.model import Model
from config import FILE_PATH, PROMPT
import traceback
from utils.mistral_api import call_mistral_api
from typing import Tuple, List, Dict, Union
import os
from moviepy.editor import VideoFileClip

mp_holistic = mp.solutions.holistic  # Holistic model
mp_drawing = mp.solutions.drawing_utils  # Drawing utilities

holistic = mp_holistic.Holistic(
    min_detection_confidence=0.5, min_tracking_confidence=0.5
)


def mediapipe_detection(
    image: np.ndarray, model: mp.solutions.holistic.Holistic
) -> Tuple[np.ndarray, mp.solutions.holistic.Holistic]:
    """
    Perform mediapipe detection on an image using the given model.

    Args:
        image (np.ndarray): The input image.
        model (mp.solutions.holistic.Holistic): The mediapipe holistic model.

    Returns:
        Tuple[np.ndarray, mp.solutions.holistic.Holistic]: The processed image and the detection results.
    """
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # COLOR CONVERSION BGR 2 RGB
    image.flags.writeable = False  # Image is no longer writeable
    results = model.process(image)  # Make prediction
    image.flags.writeable = True  # Image is now writeable
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # COLOR COVERSION RGB 2 BGR
    return image, results


def draw_styled_landmarks(
    image: np.ndarray, results: mp.solutions.holistic.Holistic
) -> None:
    """
    Draw styled landmarks on the image.

    Args:
        image (np.ndarray): The input image.
        results (mp.solutions.holistic.Holistic): The detection results.
    """
    mp_drawing.draw_landmarks(
        image,
        results.face_landmarks,
        mp_holistic.FACEMESH_TESSELATION,
        mp_drawing.DrawingSpec(color=(80, 110, 10), thickness=1, circle_radius=1),
        mp_drawing.DrawingSpec(color=(80, 256, 121), thickness=1, circle_radius=1),
    )
    mp_drawing.draw_landmarks(
        image,
        results.pose_landmarks,
        mp_holistic.POSE_CONNECTIONS,
        mp_drawing.DrawingSpec(color=(80, 22, 10), thickness=2, circle_radius=4),
        mp_drawing.DrawingSpec(color=(80, 44, 121), thickness=2, circle_radius=2),
    )
    mp_drawing.draw_landmarks(
        image,
        results.left_hand_landmarks,
        mp_holistic.HAND_CONNECTIONS,
        mp_drawing.DrawingSpec(color=(121, 22, 76), thickness=2, circle_radius=4),
        mp_drawing.DrawingSpec(color=(121, 44, 250), thickness=2, circle_radius=2),
    )
    mp_drawing.draw_landmarks(
        image,
        results.right_hand_landmarks,
        mp_holistic.HAND_CONNECTIONS,
        mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=4),
        mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2),
    )


def extract_keypoints(
    frame_id: str, results: mp.solutions.holistic.Holistic
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
                {
                    "frame": frame_id,
                    "type": "face",
                    "landmark_index": i,
                    "x": res.x,
                    "y": res.y,
                    "z": res.z,
                }
            )
    else:
        for i in range(468):
            objects.append(
                {
                    "frame": frame_id,
                    "type": "face",
                    "landmark_index": i,
                    "x": np.nan,
                    "y": np.nan,
                    "z": np.nan,
                }
            )

    # LEFT
    if results.left_hand_landmarks:
        for i, res in enumerate(results.left_hand_landmarks.landmark):
            objects.append(
                {
                    "frame": frame_id,
                    "type": "left_hand",
                    "landmark_index": i,
                    "x": res.x,
                    "y": res.y,
                    "z": res.z,
                }
            )
    else:
        for i in range(21):
            objects.append(
                {
                    "frame": frame_id,
                    "type": "left_hand",
                    "landmark_index": i,
                    "x": np.nan,
                    "y": np.nan,
                    "z": np.nan,
                }
            )

    # POSE
    if results.pose_landmarks:
        for i, res in enumerate(results.pose_landmarks.landmark):
            objects.append(
                {
                    "frame": frame_id,
                    "type": "pose",
                    "landmark_index": i,
                    "x": res.x,
                    "y": res.y,
                    "z": res.z,
                }
            )
    else:
        for i in range(33):
            objects.append(
                {
                    "frame": frame_id,
                    "type": "pose",
                    "landmark_index": i,
                    "x": np.nan,
                    "y": np.nan,
                    "z": np.nan,
                }
            )

    # RIGHT
    if results.right_hand_landmarks:
        for i, res in enumerate(results.right_hand_landmarks.landmark):
            objects.append(
                {
                    "frame": frame_id,
                    "type": "right_hand",
                    "landmark_index": i,
                    "x": res.x,
                    "y": res.y,
                    "z": res.z,
                }
            )
    else:
        for i in range(21):
            objects.append(
                {
                    "frame": frame_id,
                    "type": "right_hand",
                    "landmark_index": i,
                    "x": np.nan,
                    "y": np.nan,
                    "z": np.nan,
                }
            )

    return objects


def save_sentence(sentence: List[str], file_path: str) -> None:
    """
    Save the sentence to a text file.

    Args:
        sentence (List[str]): The sentence to be saved.
        file_path (str): The path of the output file.
    """
    text = " ".join(sentence)
    with open(file_path, "w+") as f:
        f.write(text)


def save_json(data: Union[List, Dict], file_path: str) -> None:
    """
    Save the data as JSON to a file.

    Args:
        data (Union[List, Dict]): The data to be saved.
        file_path (str): The path of the output file.
    """
    with open(file_path, "w+") as f:
        json.dump(data, f, indent=4)


def delete_file(file_path: str) -> None:
    """
    Delete a file.

    Args:
        file_path (str): The path of the file to be deleted.
    """
    os.remove(file_path)


def convert_avi_to_mp4(input_file: str, output_file: str) -> None:
    """
    Convert an AVI video file to MP4 format.

    Args:
        input_file (str): The path of the input AVI file.
        output_file (str): The path of the output MP4 file.
    """
    video = VideoFileClip(input_file)
    video.write_videofile(output_file, codec="libx264")


def get_current_duration(fps: float, frame_id: int) -> float:
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


def predict_video(
    model: Model, video_path: str, output_path: str
) -> Tuple[List[Dict[str, Union[str, float]]], List[str]]:
    """
    Predict the sign language gestures in a video.

    Args:
        model (Model): The sign language gesture recognition model.
        video_path (str): The path of the input video.
        output_path (str): The path to save the output video.

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
    NUMBER_OF_FRAMES = 30
    frame_id = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image, results = mediapipe_detection(frame, holistic)
        draw_styled_landmarks(image, results)

        if len(sequence) < NUMBER_OF_FRAMES:
            sequence.append(extract_keypoints(str(frame_id), results))
        elif len(sequence) == NUMBER_OF_FRAMES:
            seq_pred = []
            for s in sequence:
                seq_pred.extend(s)
            df = pd.DataFrame(seq_pred)
            df_imp = df.drop(["frame", "type", "landmark_index"], axis=1)

            print("[INFO]: Predicting")
            prediction, max_prob = model.predict(df_imp)

            # Remove repeated words
            if len(predictions) > 0 and prediction == predictions[-1]["word"]:
                if max_prob > float(predictions[-1]["probability"]):
                    predictions[-1]["probability"] = str(max_prob)
            else:
                sentence.append(prediction)
                predictions.append(
                    {
                        "word": prediction,
                        "probability": str(max_prob),
                        "current_duration": str(
                            round(get_current_duration(fps, frame_id), 2)
                        ),
                        "sentence_till_now": " ".join(sentence),
                        "llm_prediction": call_mistral_api(PROMPT(" ".join(sentence))),
                    }
                )
            sequence = []

        cv2.putText(
            image,
            " ".join(sentence[-5:]),
            (20, 70),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2,
            cv2.LINE_AA,
        )

        out.write(image)
        frame_id += 1

    cap.release()
    out.release()

    return predictions, sentence


def main(model: Model, video_path: str, save_name: str) -> None:
    """
    Perform sign language gesture prediction on a video.

    Args:
        model (Model): The sign language gesture recognition model.
        video_path (str): The path of the input video.
        save_name (str): The name to be used for saving the output files.
    """
    try:
        print("[INFO]: Starting prediction...")

        full_output_folder = f"{FILE_PATH}/output/{save_name}"
        os.makedirs(full_output_folder, exist_ok=True)

        output_path = f"{full_output_folder}/pred_video.avi"
        output_path_mp4 = f"{full_output_folder}/video.mp4"
        sentence_save_path = f"{full_output_folder}/prediction.txt"
        json_save_path = f"{full_output_folder}/prediction.json"
        predictions, sentence = predict_video(
            model=model, video_path=video_path, output_path=output_path
        )
        save_sentence(sentence, sentence_save_path)
        save_json(predictions, json_save_path)
        convert_avi_to_mp4(output_path, output_path_mp4)
        delete_file(output_path)

        print(f"[INFO]: Video saved at {output_path_mp4}")
        print(f"[INFO]: Sentence saved at {sentence_save_path}")
        print(f"[INFO]: JSON saved at {json_save_path}")
        print("[INFO]: Done!")
        # exit(0)
    except Exception:
        print("[ERROR]: Something went wrong!")
        traceback.print_exc()
        # exit(1)


if __name__ == "__main__":
    model = Model(
        model_path=FILE_PATH + "/weights/islr-fp16-192-8-seed42-foldall-last.h5"
    )
    model.__load__()
    video_path = FILE_PATH + "/videos/APPLE GREEN YOU LIKE EAT.mp4"
    save_name = "apple"
    main(model, video_path, save_name)
