import mediapipe as mp
import cv2
import numpy as np
import pandas as pd
from models.model import Model
from config import FILE_PATH

mp_holistic = mp.solutions.holistic  # Holistic model
mp_drawing = mp.solutions.drawing_utils  # Drawing utilities

holistic = mp_holistic.Holistic(
    min_detection_confidence=0.5, min_tracking_confidence=0.5
)


def mediapipe_detection(image: np.ndarray, model) -> tuple[np.ndarray, any]:
    """
    Perform Mediapipe detection on the given image using the provided model.

    Args:
        image (np.ndarray): The input image.
        model: The Mediapipe model.

    Returns:
        tuple[np.ndarray, any]: The processed image and the detection results.
    """
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # COLOR CONVERSION BGR 2 RGB
    image.flags.writeable = False  # Image is no longer writeable
    results = model.process(image)  # Make prediction
    image.flags.writeable = True  # Image is now writeable
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # COLOR COVERSION RGB 2 BGR
    return image, results


def draw_styled_landmarks(image: np.ndarray, results) -> None:
    """
    Draw styled landmarks on the given image using the provided results.

    Args:
        image (np.ndarray): The input image.
        results: The detection results.
    """
    # Draw face connections
    mp_drawing.draw_landmarks(
        image,
        results.face_landmarks,
        mp_holistic.FACEMESH_TESSELATION,
        mp_drawing.DrawingSpec(color=(80, 110, 10), thickness=1, circle_radius=1),
        mp_drawing.DrawingSpec(color=(80, 256, 121), thickness=1, circle_radius=1),
    )
    # Draw pose connections
    mp_drawing.draw_landmarks(
        image,
        results.pose_landmarks,
        mp_holistic.POSE_CONNECTIONS,
        mp_drawing.DrawingSpec(color=(80, 22, 10), thickness=2, circle_radius=4),
        mp_drawing.DrawingSpec(color=(80, 44, 121), thickness=2, circle_radius=2),
    )
    # Draw left hand connections
    mp_drawing.draw_landmarks(
        image,
        results.left_hand_landmarks,
        mp_holistic.HAND_CONNECTIONS,
        mp_drawing.DrawingSpec(color=(121, 22, 76), thickness=2, circle_radius=4),
        mp_drawing.DrawingSpec(color=(121, 44, 250), thickness=2, circle_radius=2),
    )
    # Draw right hand connections
    mp_drawing.draw_landmarks(
        image,
        results.right_hand_landmarks,
        mp_holistic.HAND_CONNECTIONS,
        mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=4),
        mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2),
    )


def extract_keypoints(frame_id: str, results) -> pd.DataFrame:
    """
    Extract keypoints from the given detection results.

    Args:
        frame_id (str): The frame ID.
        results: The detection results.

    Returns:
        pd.DataFrame: The extracted keypoints.
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

    df = pd.DataFrame(objects)
    return df


def predict_image(model: Model, frame: np.ndarray, file_path_output: str) -> None:
    """
    Predict the image using the provided model and save the result to the specified file path.

    Args:
        model: The model for prediction.
        frame (np.ndarray): The input image.
        file_path_output (str): The file path to save the output image.
    """
    image, results = mediapipe_detection(frame, holistic)

    draw_styled_landmarks(image, results)
    df = extract_keypoints("1", results)

    df_imp = df.drop(["frame", "type", "landmark_index"], axis=1)
    prediction, _ = model.predict(df_imp)

    cv2.putText(
        image,
        prediction,
        (20, 70),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2,
        cv2.LINE_AA,
    )

    cv2.imwrite(file_path_output, image)

    print(f"Prediction: {prediction}")
    print("Output image saved to:", file_path_output)


if __name__ == "__main__":
    model = Model(
        model_path=FILE_PATH + "/weights/islr-fp16-192-8-seed42-foldall-last.h5"
    )
    model.__load__()
    img_url = FILE_PATH + "/tests/emotions.-young-man-holding-two-hands--stop.jpg"
    frame = cv2.imread(img_url)
    predict_image(model, frame, FILE_PATH + "/output/image.jpg")
