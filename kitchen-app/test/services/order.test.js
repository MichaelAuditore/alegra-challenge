import Fastify from "fastify";
import assert from "node:assert";
import { test } from "node:test";

import { updateOrders } from "../../services/order.js";

// 🛠 Mock de PostgreSQL
const mockDB = {
    query: async (query) => {
        if (query.startsWith("INSERT INTO orders")) {
            return { rows: [{ id: crypto.randomUUID() }] }; // Simulamos ID de orden = 1
        }
        return { rows: [{ id: crypto.randomUUID() }] };
    },
    connect: async () => ({
        query: async (query) => {
            if (query.startsWith("INSERT INTO orders")) {
                return { rows: [{ id: crypto.randomUUID() }] }; // Simulamos ID de orden = 1
            }
            return { rows: [{ id: crypto.randomUUID() }] };
        },
        release: () => { },
    }),
};

// 🛠 Mock de PostgreSQL con error en la inserción de la orden
const mockDBError = {
    query: async (query) => {
        if (query.startsWith("INSERT INTO orders")) {
            throw new Error("❌ Error simulado en la base de datos"); // Simula fallo en la BD
        }
        return { rows: [{ id: crypto.randomUUID() }] };
    },
    connect: async () => ({
        query: async (query) => {
            if (query.startsWith("INSERT INTO orders")) {
                throw new Error("❌ Error simulado en la base de datos"); // Simula fallo en la BD
            }
            return { rows: [{ id: crypto.randomUUID() }] };
        },
        release: () => { },
    }),
};


async function buildFastify(error = false) {
    const fastify = Fastify();
    fastify.pg = error ? mockDBError : mockDB;
    fastify.log.info = console.log;
    return fastify;
}

// ✅ Test principal
test("updateOrders - actualizar receta orden y actualiza estado", async (t) => {
    const fastify = await buildFastify();

    // 🏗 Actualizar orden ficticia con receta ficticia
    const orderId = crypto.randomUUID();
    const recipeId = crypto.randomUUID();
    await updateOrders(fastify, orderId, recipeId);

    t.after(() => fastify.close());
});

// ❌ Test de error al crear orden
test("updateOrders - falla al actualizar orden y hace rollback", async (t) => {
    const fastify = await buildFastify(true);

    // 🏗 Actualizar orden ficticia con receta ficticia
    const orderId = crypto.randomUUID();
    const recipeId = crypto.randomUUID();

    try {
        await updateOrders(fastify, orderId, recipeId);
        assert.fail("❌ El test debería haber fallado, pero no lo hizo");
    } catch (error) {
        assert.strictEqual(
            error.message,
            "❌ Error simulado en la base de datos",
            "⚠️ Debería lanzar un error de BD"
        );
    }

    t.after(() => fastify.close());
});