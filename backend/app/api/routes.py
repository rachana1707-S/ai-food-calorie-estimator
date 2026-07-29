from fastapi import APIRouter, UploadFile, File
from PIL import Image
import shutil
import os


router = APIRouter()



@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...)
):


    upload_path = (
        "uploads/"
        + file.filename
    )


    os.makedirs(
        "uploads",
        exist_ok=True
    )


    with open(
        upload_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )



    return {

        "message":
        "Image received",

        "path":
        upload_path

    }