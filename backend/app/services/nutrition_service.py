import os
import requests

from dotenv import load_dotenv


load_dotenv()


USDA_API_KEY = os.getenv(
    "USDA_API_KEY"
)


USDA_SEARCH_URL = (
    "https://api.nal.usda.gov/fdc/v1/foods/search"
)


def get_nutrition(
    food_name: str
):

    if not USDA_API_KEY:

        raise RuntimeError(
            "USDA_API_KEY is not configured."
        )


    params = {

        "api_key": USDA_API_KEY,

        "query": food_name,

        "pageSize": 5

    }


    response = requests.get(

        USDA_SEARCH_URL,

        params=params,

        timeout=10

    )


    response.raise_for_status()


    data = response.json()


    foods = data.get(
        "foods",
        []
    )


    if not foods:

        return None


    food = foods[0]


    nutrients = {}


    for nutrient in food.get(
        "foodNutrients",
        []
    ):

        name = nutrient.get(
            "nutrientName",
            ""
        ).lower()


        value = nutrient.get(
            "value"
        )


        unit = nutrient.get(
            "unitName"
        )


        if "energy" in name:

            nutrients["calories"] = {
                "value": value,
                "unit": unit
            }


        elif "protein" in name:

            nutrients["protein"] = {
                "value": value,
                "unit": unit
            }


        elif "carbohydrate" in name:

            nutrients["carbohydrates"] = {
                "value": value,
                "unit": unit
            }


        elif "total lipid" in name:

            nutrients["fat"] = {
                "value": value,
                "unit": unit
            }


    return {

        "food_name":
            food.get(
                "description"
            ),

        "fdc_id":
            food.get(
                "fdcId"
            ),

        "nutrition":
            nutrients

    }