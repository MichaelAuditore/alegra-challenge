import fastifyPostgres from "@fastify/postgres";
import fp from "fastify-plugin";

export default fp(async function (fastify, opts) {
    fastify.register(fastifyPostgres, {
        connectionString: fastify.config.PGSQL_DATABASE_URL,
    });

    fastify.after(() => {
        fastify.log.info("✅ PostgreSQL connected")
        fastify.log.info(JSON.stringify(fastify.pg.Client.database))
    });
});
