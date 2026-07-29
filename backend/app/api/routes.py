from fastapi import APIRouter

router = APIRouter()

@router.get("/predict")
def predict():
    return {
        "food": "Pizza",
        "calories": 285
    }
