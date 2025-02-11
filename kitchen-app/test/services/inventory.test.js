import Fastify from "fastify";
import assert from "node:assert";
import { test } from "node:test";
import { WebSocketServer } from "ws";

import { requestIngredients } from "../../services/inventory.js";

// Create a mock WebSocket server
const mockWSS = new WebSocketServer({ port: 8081 });

mockWSS.on("connection", (ws) => {
    ws.on("message", () => {
        // Simulate valid response
        ws.send(JSON.stringify({ success: true, message: "Solicitud procesada" }));
    });
});

async function buildFastify() {
    const fastify = Fastify();
    fastify.config = { WS_INVENTORY: "ws://localhost:8081" };
    return fastify;
}

// ✅ Test successful ingredient request
test("requestIngredients - Success Request", async (t) => {
    const fastify = await buildFastify();
    const ingredients = { potato: 3, ketchup: 1 };

    const response = await requestIngredients(fastify, { ingredients });

    assert.strictEqual(response.success, true, "Response should indicate success");
    assert.deepStrictEqual(response.message, "Solicitud procesada");

    t.after(() => fastify.close());
});

// ❌ Test WebSocket connection failure
test("requestIngredients - WebSocket connection failure", async (t) => {
    const fastify = await buildFastify();
    fastify.config.WS_INVENTORY = "ws://localhost:9999"; // Invalid WS URL
    const ingredients = { potato: 3, ketchup: 1 };

    try {
        await requestIngredients(fastify, { ingredients });
        assert.fail("Should have thrown an error");
    } catch (error) {
        assert.ok(error, "Error should be thrown");
    }
    t.after(() => fastify.close());
});

// ✅ Close mockWSS after all tests
test.after(async (t) => {
    mockWSS.close();
});
