import Fastify from "fastify";
import assert from "node:assert";
import { test } from "node:test";

import recipesRoute from "../../routes/recipes/index.js";
import postgres from "../mocks/postgres.js";

test("GET /recipes - Mocked PostgreSQL", async (t) => {
    const fastify = Fastify();

    await fastify.register(recipesRoute);

    await fastify.ready();

    fastify.pg = postgres();

    const response = await fastify.inject({
        method: "GET",
        url: "/"
    });

    const json = response.json();

    assert.strictEqual(response.statusCode, 200, "El código de respuesta debe ser 200");
    assert.ok(Array.isArray(json.recipes), "Recipes debe ser un array");
    assert.strictEqual(json.recipes.length, 2, "Debe devolver 2 recetas");

    t.after(() => fastify.close());
});
