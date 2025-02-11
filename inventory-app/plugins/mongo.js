import fastifyMongodb from "@fastify/mongodb";
import fp from "fastify-plugin";

export default fp(async function (fastify, opts) {
    fastify.register(fastifyMongodb, {
        forceClose: true,
        url: fastify.config.MONGO_URI
    });
})