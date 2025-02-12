export async function scheduleOrderUpdates(fastify, orderId) {
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
}

// ✅ Función auxiliar para manejar el delay asincrónico
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}