export async function scheduleOrderUpdates(fastify, orderId, attempt = 1) {
    fastify.log.info(`⏳ Attempt #${attempt} - Processing Order ${orderId}`);

    // 🔹 Programar cambio a "cooking" después de 30s
    setTimeout(() => {
        fastify.redis.redisPub.publish("order_updates", JSON.stringify({
            orderId,
            status: "cooking"
        })).then(() => {
            fastify.log.info(`🔥 Order ${orderId} updated to "cooking"`);

            // 🔹 Solo después de publicar "cooking", programar "ready" en 30s más
            setTimeout(() => {
                fastify.redis.redisPub.publish("order_updates", JSON.stringify({
                    orderId,
                    status: "ready"
                })).then(() => {
                    fastify.log.info(`✅ Order ${orderId} updated to "ready"`);
                }).catch(error => {
                    fastify.log.error(`❌ Failed to update Order ${orderId} to "ready": ${error.message}`);
                });
            }, 60000);

        }).catch(error => {
            fastify.log.error(`❌ Failed to update Order ${orderId} to "cooking": ${error.message}`);
        });

    }, 30000);
}
