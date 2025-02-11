import { requestIngredients } from "./inventory.js";
import { updateOrders } from "./order.js";
import { getRandomRecipe } from "./recipe.js";

export async function processOrders(fastify) {
    fastify.log.info("👨‍🍳 Kitchen Consumer started, waiting for orders...");

    while (true) {
        try {
            const orderData = await fastify.redis.lpop("ordersQueue");

            if (orderData) {
                const order = JSON.parse(orderData);
                fastify.log.info(`🍳 Preparing order: ${order.orderId} for ${order.customer}`);

                const randomRecipe = await getRandomRecipe(fastify);
                fastify.log.info(`Recipe to cook: ${randomRecipe.key_name}`);

                const answer = await requestIngredients(fastify, randomRecipe);

                if (answer.status)
                    await updateOrders(fastify, order.orderId, randomRecipe.id);
            } else {
                // No orders? Wait a bit before retrying
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        } catch (error) {
            fastify.log.error(`❌ Error processing order: ${error}`);
        }
    }
}