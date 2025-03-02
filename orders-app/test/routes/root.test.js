import assert from "node:assert";
import test from "node:test";
import { createApp } from "../helper.js";

test("GET / - health default route", async (t) => {
  const app = await createApp();

  const response = await app.inject({
    url: "/api/v1/health"
  })

  assert.strictEqual(response.statusCode, 200, "El código de respuesta debe ser 200");

  const json = response.json();
  assert.strictEqual(json.status, "OK", "El estado debe ser 'OK'");
  assert.ok(typeof json.uptime === "number", "Uptime debe ser un número");
  assert.ok(typeof json.timestamp === "string", "Timestamp debe ser un string");
  assert.strictEqual(typeof json.redisRegistered, "boolean", "redisRegistered debe ser booleano");
  assert.strictEqual(typeof json.postgresRegistered, "boolean", "postgresRegistered debe ser booleano");

  app.close();
});