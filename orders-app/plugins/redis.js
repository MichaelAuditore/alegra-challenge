import fastifyRedis from "@fastify/redis";
import fp from "fastify-plugin";
import { updateOrder, updateOrderStatus } from "../services/orders.js";

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
        await fastify.redis.redisSub.subscribe("order_updates", async (err, count) => {
            if (err) {
                fastify.log.error("❌ Error suscribing to redis:", err);
                return;
            }
            fastify.log.info(`📡 Suscribed to ${count} channels on redis.`);
        });

        fastify.redis.redisSub.on("message", async (channel, message) => {
            if (channel !== "order_updates") return;

            const { orderId, status, recipeId } = JSON.parse(message);
            fastify.log.info(`🔄 Updating Order ${orderId} to "${status}"`);

            if (status === "pending" && recipeId) {
                await updateOrder(fastify, orderId, recipeId);
            }

            await updateOrderStatus(fastify, orderId, status);
        });

        fastify.log.info("✅ Redis connected")
    });
});