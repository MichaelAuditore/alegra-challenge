async function updateOrder(fastify, orderId, recipeId) {
    const query = `UPDATE orders SET recipe_id = $1 WHERE id = $2 RETURNING id`;
    await fastify.pg.query(query, [recipeId, orderId]);
    fastify.log.info(`🔄 Updated state: ${orderId} (Recipe ${recipeId})`);
}

async function updateOrderStatus(fastify, orderId, status) {
    const query = `INSERT INTO orders_processing (order_id, progress_status) VALUES ($1, $2) RETURNING id`;
    await fastify.pg.query(query, [orderId, status]);
    fastify.log.info(`🔄 Updated state: ${status} (Order ${orderId})`);
}

export async function updateOrders(fastify, orderId, recipeId) {
    const client = await fastify.pg.connect();

    try {
        await client.query("BEGIN");

        // Cambiar estado orden unknown -> pending
        await updateOrder(fastify, orderId, recipeId);
        await updateOrderStatus(fastify, orderId, "pending");


        await client.query("COMMIT");

        // Simular Preparación
        setTimeout(() => updateOrderStatus(fastify, orderId, "cooking"), 30000);

        // Simular Terminación
        setTimeout(() => updateOrderStatus(fastify, orderId, "ready"), 60000);
    } catch (error) {
        // ❌ Revertir en caso de error
        await client.query("ROLLBACK");
        fastify.log.error(`Error al actualizar orden: ${error}`);
        throw error;
    } finally {
        client.release();
    }
}