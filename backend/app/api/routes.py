from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io


router = APIRouter()



@router.get("/predict")
def predict():

    return {
        "food": "Pizza",
        "calories": 285
    }




@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...)
):

    try:

        contents = await file.read()

        image = Image.open(
            io.BytesIO(contents)
        )


        return {

            "filename": file.filename,

            "content_type": file.content_type,

            "width": image.width,

            "height": image.height,

            "message": "Image uploaded successfully"

        }


    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )