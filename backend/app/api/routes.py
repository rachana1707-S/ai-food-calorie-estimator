import os
import shutil
import uuid

from fastapi import APIRouter,File,HTTPException,UploadFile
from pydantic import BaseModel

from app.services.ai_service import predict_food
from app.services.nutrition_service import (
    calculate_portion_nutrition,
    get_nutrition
)
from app.services.portion_service import (
    convert_to_grams,
    get_portion_options
)

router=APIRouter()

UPLOAD_FOLDER="uploads"

ALLOWED_TYPES={
    "image/jpeg",
    "image/png",
    "image/webp"
}

class NutritionRequest(BaseModel):
    food_name:str
    unit:str
    quantity:float

@router.post("/upload")
async def upload_image(file:UploadFile=File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WebP images are supported."
        )

    os.makedirs(UPLOAD_FOLDER,exist_ok=True)

    extension=os.path.splitext(file.filename)[1].lower()
    filename=f"{uuid.uuid4()}{extension}"
    file_path=os.path.join(UPLOAD_FOLDER,filename)

    try:
        with open(file_path,"wb") as buffer:
            shutil.copyfileobj(file.file,buffer)

        prediction=predict_food(file_path)

        return {
            "filename":file.filename,
            "food":prediction["food"],
            "confidence":prediction["confidence"],
            "portion_options":get_portion_options(
                prediction["food"]
            )
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )

    finally:
        await file.close()

        if os.path.exists(file_path):
            os.remove(file_path)

@router.post("/nutrition")
async def estimate_nutrition(request:NutritionRequest):
    if request.quantity<=0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero."
        )

    try:
        grams=convert_to_grams(
            request.food_name,
            request.unit,
            request.quantity
        )

        nutrition_data=get_nutrition(
            request.food_name
        )

        nutrition=nutrition_data.get("nutrition")

        if not nutrition:
            raise HTTPException(
                status_code=404,
                detail="Nutrition information could not be found."
            )

        portion_nutrition=calculate_portion_nutrition(
            nutrition,
            grams
        )

        return {
            "food":request.food_name,
            "unit":request.unit,
            "quantity":request.quantity,
            "grams":grams,
            "nutrition":portion_nutrition,
            "usda":{
                "food_name":nutrition_data["food_name"],
                "fdc_id":nutrition_data["fdc_id"]
            }
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Nutrition calculation failed: {str(error)}"
        )