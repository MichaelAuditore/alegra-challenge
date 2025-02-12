import assert from "node:assert";
import test from "node:test";
import { build } from "../helper.js";

test("POST /orders - Creates an order successfully", async (t) => {
    const app = await build(t);

    const response = await app.inject({
        method: "POST",
        url: "/orders",
        payload: { customer: "John Doe" }
    });

    const body = response.json();

    assert.strictEqual(response.statusCode, 201, "Response should be 201 Created");
    assert.ok(body.orderId, "Response should include orderId");
    assert.strictEqual(body.customer, "John Doe", "Response should return the correct customer name");
});

test("POST /orders - Uses default customer when is empty", async (t) => {
    const app = await build(t);

    const response = await app.inject({
        method: "POST",
        url: "/orders",
        payload: { customer: "" }
    });

    const body = response.json();

    assert.strictEqual(response.statusCode, 201, "Response should be 201 Created");
    assert.strictEqual(body.customer, "default-user", "Response should default customer to 'default-user'");
});


test("POST /orders - Returns 400 when customer is missing", async (t) => {
    const app = await build(t);

    const response = await app.inject({
        method: "POST",
        url: "/orders",
        payload: {}
    });

    assert.strictEqual(response.statusCode, 400, "Response should be 400 Created");
});

test("POST /orders - Returns 500 if Redis fails", async (t) => {
    const app = await build(t);

    // ❌ Simulate Redis failure
    app.redis.rpush = async () => {
        throw new Error("Redis connection failed");
    };

    const response = await app.inject({
        method: "POST",
        url: "/orders",
        payload: { customer: "John Doe" }
    });

    assert.strictEqual(response.statusCode, 500, "Response should be 500 Internal Server Error");
});

test("GET / - Obtener lista de órdenes", async (t) => {
    const app = await build(t);

    const response = await app.inject({
        method: "GET",
        url: "/orders",
        query: { limit: "5", offset: "1" }
    });

    assert.strictEqual(response.statusCode, 200, "El código de respuesta debe ser 200");

    const json = response.json();
    assert.ok(Array.isArray(json.orders), "La respuesta debe contener una lista de órdenes");
    assert.ok(typeof json.total === "number", "El total de órdenes debe ser un número");
});

test("GET /:status - Obtener órdenes por estado", async (t) => {
    const app = await build(t);

    const response = await app.inject({
        method: "GET",
        url: "/orders/pending",
        query: { limit: "5", offset: "0" }
    });

    assert.strictEqual(response.statusCode, 200, "El código de respuesta debe ser 200");

    const json = response.json();
    assert.ok(Array.isArray(json.orders), "La respuesta debe contener una lista de órdenes");
    assert.ok(typeof json.total === "number", "El total de órdenes debe ser un número");
});

test("GET /:status - Estado no válido", async (t) => {
    const app = await build(t);

    const response = await app.inject({
        method: "GET",
        url: "/orders/coking",
        query: { limit: "5", offset: "0" }
    });

    assert.strictEqual(response.statusCode, 500, "El código de respuesta debe ser 500 en caso de error");
    const json = response.json();
    assert.strictEqual(json.error, "Failed to retrieve orders", "Debe devolver un mensaje de error");
});

test.after(() => setImmediate(() => process.exit(0)));