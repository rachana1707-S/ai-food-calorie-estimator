import os
import json
import tensorflow as tf

from tensorflow.keras import layers
from tensorflow.keras import models
from tensorflow.keras.applications import EfficientNetV2B0
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input


# --------------------------------------------------
# Configuration
# --------------------------------------------------

DATASET_PATH = "../data/food-101/images"

IMAGE_SIZE = (224, 224)

BATCH_SIZE = 32

NUM_CLASSES = 101

EPOCHS = 10

MODEL_OUTPUT_PATH = "../models/food101_efficientnetv2b0.keras"

CLASS_NAMES_PATH = "../config/food101_class_names.json"


# --------------------------------------------------
# Load dataset
# --------------------------------------------------

train_dataset = tf.keras.utils.image_dataset_from_directory(

    DATASET_PATH,

    validation_split=0.2,

    subset="training",

    seed=42,

    image_size=IMAGE_SIZE,

    batch_size=BATCH_SIZE

)


validation_dataset = tf.keras.utils.image_dataset_from_directory(

    DATASET_PATH,

    validation_split=0.2,

    subset="validation",

    seed=42,

    image_size=IMAGE_SIZE,

    batch_size=BATCH_SIZE

)


class_names = train_dataset.class_names


print("Number of classes:", len(class_names))


# --------------------------------------------------
# Save class names
# --------------------------------------------------

os.makedirs(
    os.path.dirname(CLASS_NAMES_PATH),
    exist_ok=True
)


with open(
    CLASS_NAMES_PATH,
    "w"
) as file:

    json.dump(
        class_names,
        file,
        indent=4
    )


# --------------------------------------------------
# Performance optimization
# --------------------------------------------------

AUTOTUNE = tf.data.AUTOTUNE


train_dataset = train_dataset.prefetch(
    buffer_size=AUTOTUNE
)


validation_dataset = validation_dataset.prefetch(
    buffer_size=AUTOTUNE
)


# --------------------------------------------------
# Data augmentation
# --------------------------------------------------

data_augmentation = tf.keras.Sequential([

    layers.RandomFlip(
        "horizontal"
    ),

    layers.RandomRotation(
        0.1
    ),

    layers.RandomZoom(
        0.1
    ),

])


# --------------------------------------------------
# Base EfficientNetV2B0 model
# --------------------------------------------------

base_model = EfficientNetV2B0(

    include_top=False,

    weights="imagenet",

    input_shape=(
        224,
        224,
        3
    )

)


# Freeze pretrained layers

base_model.trainable = False


# --------------------------------------------------
# Build classifier
# --------------------------------------------------

inputs = layers.Input(
    shape=(
        224,
        224,
        3
    )
)


x = data_augmentation(
    inputs
)


x = preprocess_input(
    x
)


x = base_model(
    x,
    training=False
)


x = layers.GlobalAveragePooling2D()(
    x
)


x = layers.Dropout(
    0.3
)(
    x
)


outputs = layers.Dense(

    NUM_CLASSES,

    activation="softmax"

)(
    x
)


model = models.Model(

    inputs,
    outputs

)


# --------------------------------------------------
# Compile
# --------------------------------------------------

model.compile(

    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.001
    ),

    loss="sparse_categorical_crossentropy",

    metrics=[
        "accuracy"
    ]

)


model.summary()


# --------------------------------------------------
# Initial training
# --------------------------------------------------

history = model.fit(

    train_dataset,

    validation_data=validation_dataset,

    epochs=EPOCHS

)


# --------------------------------------------------
# Fine-tuning
# --------------------------------------------------

base_model.trainable = True


# Freeze most layers

for layer in base_model.layers[:-30]:

    layer.trainable = False


model.compile(

    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.00001
    ),

    loss="sparse_categorical_crossentropy",

    metrics=[
        "accuracy"
    ]

)


fine_tune_epochs = 5


model.fit(

    train_dataset,

    validation_data=validation_dataset,

    epochs=fine_tune_epochs

)


# --------------------------------------------------
# Save model
# --------------------------------------------------

os.makedirs(

    os.path.dirname(
        MODEL_OUTPUT_PATH
    ),

    exist_ok=True

)


model.save(
    MODEL_OUTPUT_PATH
)


print(
    "Model saved to:",
    MODEL_OUTPUT_PATH
)