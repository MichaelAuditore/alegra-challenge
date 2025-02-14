import { requestIngredients } from "./inventory.js";
import { scheduleOrderUpdates } from "./order.js";
import { getRandomRecipe } from "./recipe.js";

export async function processOrders(fastify, orderId) {
    fastify.log.info(`🍳 Order ${orderId} received, selecting recipe...`);

    // 1️⃣ Escoger receta aleatoria
    const randomRecipe = await getRandomRecipe(fastify);
    const recipeId = randomRecipe.id;

    if (!recipeId) {
        fastify.log.error(`🚨 No recipes available for Order ${orderId}`);
        return;
    }

    const answer = await requestIngredients(fastify, "wss", randomRecipe);
    if (answer.status) {
        // 📢 Publicar actualización en Redis con la receta asignada
        await fastify.redis.redisPub.publish("order_updates", JSON.stringify({
            orderId,
            status: "pending",
            recipeId
        }));
    }

    await scheduleOrderUpdates(fastify, orderId);
}