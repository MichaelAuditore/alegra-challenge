import fastifyEnv from "@fastify/env";
import Fastify from "fastify";
import assert from "node:assert";
import { test } from "node:test";

import postgresPlugin from "../../plugins/postgres.js";
import { envSchema } from "../../schemas/env.schema.js";

test("Postgres plugin registers correctly", async (t) => {
    const fastify = Fastify();
    process.env.PGSQL_DATABASE_URL = "url-mock:3306";
    process.env.REDIS = "mockRedis://default:3306";
    process.env.WS_INVENTORY = "ws://mock-url";

    const envOptions = {
        confKey: "config",
        schema: envSchema,
        dotenv: true
    }

    await fastify.register(fastifyEnv, envOptions);
    await fastify.register(postgresPlugin);
    await fastify.ready();

    // ✅ Check if Swagger is correctly registered
    const postgresConfig = fastify.pg;
    assert.ok(postgresConfig, "Postgres should be available");

    // ✅ Ensure Fastify closes properly
    t.after(() => fastify.close());
});