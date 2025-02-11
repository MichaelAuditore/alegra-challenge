import got from "got";

export async function createAuditPurchase(collection, purchase) {
    await collection.insertOne(purchase);
}

export async function getPurchases(collection, { offset = 0, limit = 5 }) {
    const result = await collection.aggregate([
        {
            $facet: {
                totalCount: [{ $count: "total" }],
                purchases: [
                    { $sort: { purchasedDate: -1 } },
                    { $skip: Number(offset) },
                    { $limit: Number(limit) }
                ]
            }
        }
    ]).toArray();

    const totalCount = result[0].totalCount[0]?.total || 0;
    const purchases = result[0].purchases;

    return { purchases, total: totalCount };
}

export async function purchaseIngredient(fastify, ingredientName) {
    const API_PURCHASE = fastify.config.PURCHASE_URL;

    try {
        const response = await got(API_PURCHASE, {
            searchParams: { ingredient: ingredientName.toLowerCase() },
            responseType: "json"
        });

        const { quantitySold } = response.body;
        fastify.log.info(`Attempted purchase for ${ingredientName}: quantitySold = ${quantitySold}`);

        if (quantitySold > 0) {
            return quantitySold;
        } else {
            fastify.log.warn(`No units sold for ${ingredientName}. Waiting to retry...`);

            // Simulates Wait for Buying (15sec)
            await new Promise(resolve => setTimeout(resolve, 15000));
            return purchaseIngredient(fastify, ingredientName);
        }
    } catch (error) {
        fastify.log.error(`Error purchasing ${ingredientName}: ${error.message}`);
        throw error;
    }
}