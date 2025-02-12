db.createCollection("ingredients");
db.createCollection("purchases");

db.ingredients.insertMany([
    { "key_name": "rice", "stock": 5, "image_url": "/rice.svg" },
    { "key_name": "tomato", "stock": 5, "image_url": "/tomato.svg" },
    { "key_name": "potato", "stock": 5, "image_url": "/potato.svg" },
    { "key_name": "onion", "stock": 5, "image_url": "/rice.svg" },
    { "key_name": "ketchup", "stock": 5, "image_url": "/ketchup.svg" },
    { "key_name": "chicken", "stock": 5, "image_url": "/chicken.svg" },
    { "key_name": "lettuce", "stock": 5, "image_url": "/lettuce.svg" },
    { "key_name": "cheese", "stock": 5, "image_url": "/cheese.svg" },
    { "key_name": "meat", "stock": 5, "image_url": "/meat.svg" },
    { "key_name": "lemon", "stock": 5, "image_url": "/lemon.svg" }
]);