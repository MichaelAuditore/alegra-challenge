import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";

export default fp(async function (fastify, opts) {
    fastify.register(fastifySwagger, {
        openapi: {
            info: {
                title: "Inventory API",
                version: "1.0.0"
            }
        }
    });

    fastify.register(fastifySwaggerUi, {
        routePrefix: "/inventory-service/documentation",
        exposeRoute: true
    });
});
