import os
import requests
from dotenv import load_dotenv

load_dotenv()

USDA_API_KEY = os.getenv("USDA_API_KEY")

USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"


def get_nutrition(food_name: str):

    if not USDA_API_KEY:
        raise RuntimeError("USDA_API_KEY is not configured.")

    # Food-101 names use underscores, e.g. "chicken_curry"
    search_name = food_name.replace("_", " ")

    params = {
        "api_key": USDA_API_KEY,
        "query": search_name,
        "pageSize": 10,
    }

    response = requests.get(
        USDA_SEARCH_URL,
        params=params,
        timeout=10,
    )

    response.raise_for_status()

    data = response.json()

    foods = data.get("foods", [])

    if not foods:
        return {
            "food_name": search_name,
            "fdc_id": None,
            "nutrition": None,
        }

    # Prefer a result whose description closely matches
    # the predicted Food-101 class.
    normalized_search = search_name.lower()

    best_food = foods[0]

    for food in foods:
        description = food.get("description", "").lower()

        if normalized_search in description:
            best_food = food
            break

    nutrients = {}

    for nutrient in best_food.get("foodNutrients", []):

        name = nutrient.get("nutrientName", "").lower()
        value = nutrient.get("value")
        unit = nutrient.get("unitName")

        if value is None:
            continue

        if "energy" in name and "kcal" in str(unit).lower():
            nutrients["calories"] = {
                "value": value,
                "unit": unit,
            }

        elif "protein" in name:
            nutrients["protein"] = {
                "value": value,
                "unit": unit,
            }

        elif "carbohydrate" in name:
            nutrients["carbohydrates"] = {
                "value": value,
                "unit": unit,
            }

        elif "total lipid" in name:
            nutrients["fat"] = {
                "value": value,
                "unit": unit,
            }

    return {
        "food_name": best_food.get("description"),
        "fdc_id": best_food.get("fdcId"),
        "nutrition": nutrients,
    }