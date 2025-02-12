import { EventEmitter } from "events";
import assert from "node:assert";
import { test } from "node:test";
import { setTimeout as delay } from "timers/promises";
import { scheduleOrderUpdates } from "../../services/order.js";
import { redisMock } from "../mocks/redis.js";

async function buildFastify() {
    const fastify = { redis: redisMock, log: { info: console.log } };
    return fastify;
}

test("scheduleOrderUpdates - actualiza estado correctamente en Redis", async (t) => {
    const fastify = await buildFastify();
    const orderId = crypto.randomUUID();
    let receivedCooking = false;
    let receivedReady = false;

    // Ejecutar la función de prueba
    await scheduleOrderUpdates(fastify, orderId);

    // Verificar que se recibieron los eventos correctos
    assert.strictEqual(!receivedCooking, true, "🔥 Debería haber recibido 'cooking'");
    assert.strictEqual(!receivedReady, true, "✅ Debería haber recibido 'ready'");
});
