import assert from "node:assert";
import { test } from "node:test";

import { createApp } from "../helper.js";

test("Postgres plugin registers correctly", async (t) => {
    const fastify = await createApp();

    // ✅ Check if Swagger is correctly registered
    const postgresConfig = fastify.pg;
    assert.ok(postgresConfig, "Postgres should be available");

    // ✅ Ensure Fastify closes properly
    t.after(() => fastify.close());
});