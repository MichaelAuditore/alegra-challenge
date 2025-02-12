import Fastify from "fastify";
import assert from "node:assert";
import { test } from "node:test";

import swaggerPlugin from "../../plugins/swagger.js";

test("Swagger plugin registers correctly", async (t) => {
    const fastify = Fastify();

    await fastify.register(swaggerPlugin);
    await fastify.ready(); // ✅ Ensures all plugins are loaded

    // ✅ Check if Swagger is correctly registered
    const swaggerConfig = fastify.swagger();
    assert.ok(swaggerConfig, "Swagger should be available");
    assert.strictEqual(swaggerConfig.info.title, "Orders API", "Swagger title should match");

    // ✅ Ensure Fastify closes properly
    t.after(() => fastify.close());
});
