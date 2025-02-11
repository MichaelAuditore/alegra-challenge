import { createAuditPurchase, purchaseIngredient } from "./purchase.js";

export async function getAllIngredients(collection) {
    const ingredients = await collection.find({}).toArray();

    return ingredients;
}

export async function getIngredientByName(collection, ingredientName) {
    const ingredient = await collection.findOne({ key_name: ingredientName });
    return ingredient;
}

async function discountQuantity(collection, ingredient) {
    const { name, quantity } = ingredient;

    // 🔍 Filtra solo si hay suficiente stock
    const result = await collection.findOneAndUpdate(
        { key_name: name, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { returnDocument: "after" }
    );

    return typeof result?.stock === "number" ? result?.stock : 0;
}

async function addQuantity(collection, ingredient) {
    const { name, quantity } = ingredient;
    await collection.updateOne(
        { key_name: name },
        { $inc: { stock: quantity } }
    );
}

async function updateIngredientStock(fastify, ingredient) {
    const collection = fastify.mongo.db.collection("ingredients");
    const { name, quantity } = ingredient;

    let quantityNotInStock = true;

    while (quantityNotInStock) {
        try {
            // Try to discount quantity
            const updatedStock = await discountQuantity(collection, ingredient);

            if (updatedStock > 0) {
                quantityNotInStock = false;
                fastify.log.info(`Update Stock for product ${name}. New stock: ${updatedStock}`);
            } else {
                throw new Error("Insufficient Stock");
            }

        } catch (error) {
            fastify.log.warn(`Insufficient stock for product ${name}. Required to discount ${quantity} unit(s). Starts a buy.`);

            const quantityPurchased = await purchaseIngredient(fastify, name);
            fastify.log.info(`Bought ${quantityPurchased} ${name} units.`);
            if (quantityPurchased > 0) {
                const purchasesCollection = fastify.mongo.db.collection("purchases");
                await createAuditPurchase(purchasesCollection, {
                    key_name: name,
                    purchasedStock: quantityPurchased,
                    purchasedDate: new Date().toString()
                });
            }

            await addQuantity(collection, { name, quantity: quantityPurchased });

            // Ensure stock is updated before retrying
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

export async function handleKitchenRequest(fastify, requestedIngredients) {
    for (const [ingredient, quantity] of Object.entries(requestedIngredients)) {
        await updateIngredientStock(fastify, { name: ingredient, quantity });
    }
}