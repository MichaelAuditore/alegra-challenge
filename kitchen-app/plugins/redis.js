import fp from "fastify-plugin";
import fastifyRedis from "@fastify/redis";

import { processOrders } from "../services/queue.js";

export default fp(async function (fastify, opts) {
    // 🔹 Conexión para publicar eventos
    fastify.register(fastifyRedis, {
        namespace: "redisPub",
        url: fastify.config.REDIS_URL
    });

    // 🔹 Conexión para suscribirse a eventos
    fastify.register(fastifyRedis, {
        namespace: "redisSub",
        url: fastify.config.REDIS_URL
    });

    fastify.after(async () => {
        await fastify.redis.redisSub.subscribe("new_order", async (err, count) => {
            if (err) {
                fastify.log.error("❌ Error suscribing:", err);
                return;
            }
            fastify.log.info(`📡 Suscribed to ${count} channels on redis.`);
        });

        fastify.redis.redisSub.on("message", async (channel, message) => {
            console.log('channel: ', channel);
            if (channel !== "new_order") return;

            const { orderId, status } = JSON.parse(message);

            console.log('Status Order: ', status);
            console.log('Id Order: ', orderId);

            if (status === "unknown") processOrders(fastify, orderId)
        });
    })
    fastify.log.info("✅ Redis UI initialized.");

});
