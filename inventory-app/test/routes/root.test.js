import Fastify from "fastify";
import assert from "node:assert";
import { test } from "node:test";

import healthRoute from "../../routes/root.js";

test("GET / - health route", async (t) => {
  const fastify = Fastify();

  await fastify.register(healthRoute);
  await fastify.ready();

  const response = await fastify.inject({
    method: "GET",
    url: "/health"
  });

  const json = response.json();

  assert.strictEqual(json.status, "OK", "El estado debe ser 'OK'");
  assert.ok(typeof json.uptime === "number", "Uptime debe ser un número");
  assert.ok(typeof json.timestamp === "string", "Timestamp debe ser un string");
  assert.strictEqual(typeof json.mongoRegistered, "boolean", "mongoRegistered debe ser booleano");

  t.after(() => fastify.close());
});