CALORIES = {

    "pizza": 285,

    "hamburger": 295,

    "french fries": 312,

    "rice": 130,

    "sushi": 150,

    "salad": 33,

    "ice cream": 207,

    "pasta": 157,

    "apple": 52,

    "banana": 89

}



def get_calories(food):

    food = food.lower()

    return CALORIES.get(
        food,
        100
    )