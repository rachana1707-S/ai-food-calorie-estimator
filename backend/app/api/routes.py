import os
import shutil
import uuid

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)

from app.services.ai_service import predict_food


router = APIRouter()


UPLOAD_FOLDER = "uploads"


ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp"
}


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...)
):

    # ----------------------------------------------
    # Validate file type
    # ----------------------------------------------

    if file.content_type not in ALLOWED_TYPES:

        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WebP images are supported."
        )


    # ----------------------------------------------
    # Create upload directory
    # ----------------------------------------------

    os.makedirs(
        UPLOAD_FOLDER,
        exist_ok=True
    )


    # ----------------------------------------------
    # Create unique filename
    # ----------------------------------------------

    extension = os.path.splitext(
        file.filename
    )[1]

    filename = (
        f"{uuid.uuid4()}{extension}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )


    # ----------------------------------------------
    # Save image
    # ----------------------------------------------

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    # ----------------------------------------------
    # AI prediction
    # ----------------------------------------------

    try:

        prediction = predict_food(
            file_path
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"AI prediction failed: {str(error)}"
        )


    # ----------------------------------------------
    # Response
    # ----------------------------------------------

    return {

        "filename": file.filename,

        "food": prediction["food"],

        "confidence": prediction["confidence"]

    }