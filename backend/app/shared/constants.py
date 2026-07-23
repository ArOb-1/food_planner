FOOD_DICT: dict[str, str] = {
    # Мясо и птица
    "курица": "chicken",      "куриная": "chicken",    "куриный": "chicken",
    "куриные": "chicken",     "цыплёнок": "chicken",   "говядина": "beef",
    "говяжий": "beef",        "говяжья": "beef",        "свинина": "pork",
    "свиная": "pork",         "свиные": "pork",         "баранина": "lamb",
    "бараний": "lamb",        "индейка": "turkey",      "индюшка": "turkey",
    "утка": "duck",           "кролик": "rabbit",       "стейк": "steak",
    "котлеты": "meatballs",   "фарш": "mince",          "ребрышки": "ribs",
    # Рыба и морепродукты
    "лосось": "salmon",       "сёмга": "salmon",        "тунец": "tuna",
    "треска": "cod",          "форель": "trout",        "рыба": "fish",
    "креветки": "shrimp",     "морепродукты": "seafood", "кальмар": "squid",
    "мидии": "mussels",       "краб": "crab",
    # Крупы и паста
    "паста": "pasta",         "спагетти": "spaghetti",  "макароны": "pasta",
    "рис": "rice",            "гречка": "buckwheat",    "гречневая": "buckwheat",
    "овсянка": "oatmeal",     "каша": "porridge",       "киноа": "quinoa",
    "булгур": "bulgur",       "перловка": "barley",     "кускус": "couscous",
    # Овощи
    "картофель": "potato",    "картошка": "potato",     "картошкой": "potato",
    "помидоры": "tomato",     "томаты": "tomato",       "огурец": "cucumber",
    "баклажан": "eggplant",   "кабачок": "zucchini",    "тыква": "pumpkin",
    "морковь": "carrot",      "брокколи": "broccoli",   "шпинат": "spinach",
    "грибы": "mushroom",      "шампиньоны": "mushroom", "чечевица": "lentils",
    "фасоль": "beans",        "нут": "chickpeas",
    # Блюда
    "суп": "soup",            "борщ": "borscht",        "окрошка": "okroshka",
    "салат": "salad",         "пицца": "pizza",         "бургер": "burger",
    "сэндвич": "sandwich",    "тост": "toast",           "блины": "pancakes",
    "оладьи": "pancakes",     "омлет": "omelette",      "яичница": "scrambled eggs",
    "яйца": "eggs",           "яйцо": "egg",            "сырники": "cheesecakes",
    "творог": "cottage cheese", "йогурт": "yogurt",      "пельмени": "dumplings",
    "вареники": "dumplings",  "запеканка": "casserole", "рагу": "stew",
    "плов": "pilaf",          "ризотто": "risotto",     "лазанья": "lasagne",
    "карри": "curry",         "вок": "stir fry",        "роллы": "sushi",
    "крем":      "cream",     "овощей":    "vegetable", "овощами":   "vegetable",
    "овощи":     "vegetable", "овощной":   "vegetable", "суп":       "soup",
    "крем-суп": "cream soup", "похлёбка":  "soup", "бульон":    "broth",
    "минестроне": "minestrone", "сырники":      "cottage cheese pancakes",
    "творожники":   "cottage cheese pancakes",
    "творог":       "cottage cheese",
    "творожный":    "cottage cheese",

    # Ягоды и фрукты
    "клубника":     "strawberry",
    "клубничный":   "strawberry",
    "клубничным":   "strawberry",
    "малина":       "raspberry",
    "малиновый":    "raspberry",
    "черника":      "blueberry",
    "вишня":        "cherry",
    "персик":       "peach",
    "манго":        "mango",
    "банан":        "banana",

    # Соусы и добавки
    "соус":         "sauce",
    "соусом":       "sauce",
    "соусе":        "sauce",
    "подливка":     "gravy",
    "сироп":        "syrup",
    "джем":         "jam",
    "варенье":      "jam",

    # ── Яичные блюда ─────────────────────────────────────────────────────
    "яиц":          "eggs",
    "омлет":        "omelette",
    "глазунья":     "fried eggs",
    "болтунья":     "scrambled eggs",

    # ── Помидоры (все падежи) ─────────────────────────────────────────────
    "помидор":      "tomato",
    "помидоры":     "tomato",
    "помидором":    "tomato",
    "помидорами":   "tomato",   # ← именно этот падеж был в блюде
    "помидорах":    "tomato",
    "томат":        "tomato",
    "томаты":       "tomato",
    "томатный":     "tomato",

    # ── Зелень ───────────────────────────────────────────────────────────
    "зелень":       "herbs",
    "зеленью":      "herbs",    # ← именно этот падеж был в блюде
    "зелёный":      "herbs",
    "укроп":        "dill",
    "петрушка":     "parsley",
    "петрушки":     "parsley",
    "базилик":      "basil",
    "кинза":        "coriander",
    "тимьян":       "thyme",
    "розмарин":     "rosemary",
    "орегано":      "oregano",
    "мята":         "mint",
    "шпинат":       "spinach",

    # ── Специи и приправы ────────────────────────────────────────────────
    "соль":         "salt",
    "перец":        "pepper",
    "чеснок":       "garlic",
    "чесноком":     "garlic",
    "лук":          "onion",
    "луком":        "onion",
    "имбирь":       "ginger",
    "куркума":      "turmeric",
    "паприка":      "paprika",
}

MEALDB_SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/search.php"
MEALDB_FILTER_URL = "https://www.themealdb.com/api/json/v1/1/filter.php"
MEALDB_LOOKUP_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php"

CACHE_TTL = 60 * 60 * 24

MEAL_TYPE_CATEGORIES: dict[str, list[str]] = {
    "завтрак":  ["breakfast", "dessert"],
    "breakfast": ["breakfast", "dessert"],
    "обед":     ["beef", "chicken", "pork", "pasta", "seafood", "lamb", "soup", "vegetarian"],
    "lunch":    ["beef", "chicken", "pork", "pasta", "seafood", "lamb", "soup", "vegetarian"],
    "ужин":     ["beef", "chicken", "pasta", "seafood", "vegetarian", "lamb"],
    "dinner":   ["beef", "chicken", "pasta", "seafood", "vegetarian", "lamb"],
    "перекус":  ["starter", "side", "miscellaneous", "dessert"],
    "snack":    ["starter", "side", "miscellaneous", "dessert"],
}

DISH_CATEGORY_MAP: dict[str, str] = {
    "суп":       "Soup",
    "паста":     "Pasta",
    "пицца":     "Miscellaneous",
    "салат":     "Side",
    "десерт":    "Dessert",
    "завтрак":   "Breakfast",
    "омлет":     "Breakfast",
    "каша":      "Breakfast",
    "стейк":     "Beef",
    "котлеты":   "Beef",
    "курица":    "Chicken",
    "рыба":      "Seafood",
    "паста":     "Pasta",
    "карри":     "Chicken",
    "яичница":  "Breakfast",
    "глазунья": "Breakfast",
    "болтунья": "Breakfast",
}
