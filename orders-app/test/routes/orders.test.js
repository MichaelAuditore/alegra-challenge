import assert from "node:assert";
import test from "node:test";
import { createApp } from "../helper.js";

test("POST /orders - Creates an order successfully", async (t) => {
    const app = await createApp();

    const response = await app.inject({
        method: "POST",
        url: "api/v1/orders",
        payload: { customer: "John Doe" }
    });

    const body = response.json();

    assert.strictEqual(response.statusCode, 201, "Response should be 201 Created");
    assert.ok(body.orderId, "Response should include orderId");
    assert.strictEqual(body.customer, "John Doe", "Response should return the correct customer name");

    app.close();
});

test("POST /orders - Uses default customer when is empty", async (t) => {
    const app = await createApp();

    const response = await app.inject({
        method: "POST",
        url: "/api/v1/orders",
        payload: { customer: "" }
    });

    const body = response.json();

    assert.strictEqual(response.statusCode, 201, "Response should be 201 Created");
    assert.strictEqual(body.customer, "default-user", "Response should default customer to 'default-user'");
    app.close();
});

test("POST /orders - Returns 400 when customer is missing", async (t) => {
    const app = await createApp();

    const response = await app.inject({
        method: "POST",
        url: "/api/v1/orders",
        payload: {}
    });

    assert.strictEqual(response.statusCode, 400, "Response should be 400 Created");
    app.close();
});

test("POST /orders - Returns 500 if Redis fails", async (t) => {
    const app = await createApp();

    // ❌ Simulate Redis failure
    app.redis.redisPub.publish = async () => {
        throw new Error("Redis connection failed");
    };

    const response = await app.inject({
        method: "POST",
        url: "api/v1/orders",
        payload: { customer: "John Doe" }
    });

    assert.strictEqual(response.statusCode, 500, "Response should be 500 Internal Server Error");
    app.close();
});

test("GET / - Obtener lista de órdenes", async (t) => {
    const app = await createApp();

    const response = await app.inject({
        method: "GET",
        url: "api/v1/orders",
        query: { limit: "5", offset: "1" }
    });

    assert.strictEqual(response.statusCode, 200, "El código de respuesta debe ser 200");

    const json = response.json();
    assert.ok(Array.isArray(json.orders), "La respuesta debe contener una lista de órdenes");
    assert.ok(typeof json.total === "number", "El total de órdenes debe ser un número");
    app.close();
});

test("GET /:status - Obtener órdenes por estado", async (t) => {
    const app = await createApp();

    const response = await app.inject({
        method: "GET",
        url: "/api/v1/orders/pending",
        query: { limit: "5", offset: "0" }
    });

    assert.strictEqual(response.statusCode, 200, "El código de respuesta debe ser 200");

    const json = response.json();
    assert.ok(Array.isArray(json.orders), "La respuesta debe contener una lista de órdenes");
    assert.ok(typeof json.total === "number", "El total de órdenes debe ser un número");
    app.close();
});

test("GET /:status - Estado no válido", async (t) => {
    const app = await createApp();

    const response = await app.inject({
        method: "GET",
        url: "/api/v1/orders/coking",
        query: { limit: "5", offset: "0" }
    });

    assert.strictEqual(response.statusCode, 400, "El código de respuesta debe ser 400 en caso Bad Request");
    const json = response.json();
    assert.strictEqual(json.error, "Bad Request");
    app.close();
});