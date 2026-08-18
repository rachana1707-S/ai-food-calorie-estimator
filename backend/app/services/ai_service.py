import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image


# --------------------------------------------------
# Paths
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    PROJECT_ROOT
    / "ai-model"
    / "models"
    / "food101_efficientnetv2b0_final.keras"
)

CLASS_NAMES_PATH = (
    PROJECT_ROOT
    / "ai-model"
    / "config"
    / "food101_class_names.json"
)


# --------------------------------------------------
# Load model
# --------------------------------------------------

print("Loading food classification model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("Food classification model loaded.")


# --------------------------------------------------
# Load Food-101 class names
# --------------------------------------------------

with open(
    CLASS_NAMES_PATH,
    "r"
) as file:

    CLASS_NAMES = json.load(file)


# --------------------------------------------------
# Image preprocessing
# --------------------------------------------------

IMAGE_SIZE = (
    224,
    224
)


def preprocess_image(
    image_path: str
):

    image = Image.open(
        image_path
    ).convert("RGB")

    image = image.resize(
        IMAGE_SIZE
    )

    image_array = np.array(
        image,
        dtype=np.float32
    )

    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    return image_array


# --------------------------------------------------
# Prediction
# --------------------------------------------------

def predict_food(
    image_path: str
):

    image = preprocess_image(
        image_path
    )

    predictions = model.predict(
        image,
        verbose=0
    )

    probabilities = predictions[0]

    predicted_index = int(
        np.argmax(probabilities)
    )

    confidence = float(
        probabilities[predicted_index]
    )

    food_name = CLASS_NAMES[
        predicted_index
    ]

    return {

        "food": food_name,

        "confidence": round(
            confidence * 100,
            2
        )

    }