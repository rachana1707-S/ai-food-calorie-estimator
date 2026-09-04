PORTION_RULES=[
    {
        "keywords":["pizza"],
        "units":[
            {"value":"slice","label":"Slice","grams":100},
            {"value":"gram","label":"Grams","grams":1}
        ]
    },
    {
        "keywords":["cake","pie","cheesecake"],
        "units":[
            {"value":"slice","label":"Slice","grams":100},
            {"value":"gram","label":"Grams","grams":1}
        ]
    },
    {
        "keywords":["banana","apple","orange","pear"],
        "units":[
            {"value":"piece","label":"Piece","grams":120},
            {"value":"gram","label":"Grams","grams":1}
        ]
    },
    {
        "keywords":["burger","hamburger","sandwich"],
        "units":[
            {"value":"piece","label":"Piece","grams":250},
            {"value":"gram","label":"Grams","grams":1}
        ]
    },
    {
        "keywords":["french_fries","fries"],
        "units":[
            {"value":"serving","label":"Serving","grams":117},
            {"value":"gram","label":"Grams","grams":1}
        ]
    },
    {
        "keywords":["rice","risotto"],
        "units":[
            {"value":"cup","label":"Cup","grams":158},
            {"value":"gram","label":"Grams","grams":1}
        ]
    },
    {
        "keywords":["salad"],
        "units":[
            {"value":"cup","label":"Cup","grams":100},
            {"value":"gram","label":"Grams","grams":1}
        ]
    }
]

DEFAULT_UNITS=[
    {"value":"serving","label":"Serving","grams":100},
    {"value":"gram","label":"Grams","grams":1}
]

def get_portion_options(food_name:str):
    normalized=food_name.lower()

    for rule in PORTION_RULES:
        if any(keyword in normalized for keyword in rule["keywords"]):
            return rule["units"]

    return DEFAULT_UNITS

def convert_to_grams(food_name:str,unit:str,quantity:float):
    if quantity<=0:
        raise ValueError("Quantity must be greater than zero.")

    options=get_portion_options(food_name)

    for option in options:
        if option["value"]==unit:
            return round(quantity*option["grams"],2)

    raise ValueError("Invalid portion unit.")