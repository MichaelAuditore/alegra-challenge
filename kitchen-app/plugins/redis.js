import fp from "fastify-plugin";
import fastifyRedis from "@fastify/redis";

import { processOrders } from "../services/queue.js";

export default fp(async function (fastify, opts) {
    fastify.register(fastifyRedis, {
        url: fastify.config.REDIS_URL,
    });

    fastify.log.info("✅ Redis UI initialized.");

    fastify.decorate("publishToQueue", async (queueName, message) => {
        try {
            await fastify.redis.rpush(queueName, JSON.stringify(message));
            fastify.log.info(`Message published in queue "${queueName}"`);
        } catch (error) {
            fastify.log.error(`Error publishing in the queue "${queueName}": ${error}`);
            throw error;
        }
    });

    fastify.after(() => {
        processOrders(fastify).catch(fastify.log.error);
    });

});
