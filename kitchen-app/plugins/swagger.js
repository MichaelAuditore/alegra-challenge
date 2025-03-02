import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

export default fp(async function (fastify, opts) {
    fastify.register(fastifySwagger, {
        openapi: {
            info: {
                title: "Kitchen API",
                version: "1.0.0"
            }
        }
    });

    fastify.register(fastifySwaggerUI, {
        routePrefix: "/api/v1/documentation",
        exposeRoute: true
    });

    fastify.log.info("✅ Swagger UI initialized.");
});
