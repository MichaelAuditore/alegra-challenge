export async function scheduleOrderUpdates(fastify, orderId, attempt = 1) {

    try {
        fastify.log.info(`⏳ Attempt #${attempt} - Processing Order ${orderId}`);

        await delay(30000); // 🕒 Esperar 30s y actualizar a "cooking"
        await fastify.redis.redisPub.publish("order_updates", JSON.stringify({
            orderId,
            status: "cooking"
        }));
        fastify.log.info(`🔥 Order ${orderId} updated to "cooking"`);

        await delay(30000); // 🕒 Esperar otros 30s y actualizar a "ready"
        await fastify.redis.redisPub.publish("order_updates", JSON.stringify({
            orderId,
            status: "ready"
        }));
        fastify.log.info(`✅ Order ${orderId} updated to "ready"`);

    } catch (error) {
        fastify.log.error(`❌ Error in scheduleOrderUpdates (Attempt #${attempt}): ${error.message}`);

        if (attempt < 3) { // 🔁 Reintentar hasta 3 veces
            await delay(60000); // 🕒 Esperar 1 minuto antes de reintentar
            return scheduleOrderUpdates(fastify, orderId, attempt + 1);
        } else {
            fastify.log.error(`🚨 Process failed, order ${orderId} died after 3 attempts`);
        }
    }

}

// ✅ Función auxiliar para manejar el delay asincrónico
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}