export async function updateOrder(fastify, orderId, recipeId) {
    const query = `UPDATE orders SET recipe_id = $1 WHERE id = $2 RETURNING id`;
    await fastify.pg.query(query, [recipeId, orderId]);
    fastify.log.info(`🔄 Order updated: ${orderId} (Recipe ${recipeId})`);
}

export async function updateOrderStatus(fastify, orderId, status) {
    // 🔹 Verificar el último estado registrado
    const checkQuery = `SELECT progress_status FROM orders_processing 
                        WHERE order_id = $1 ORDER BY last_updated DESC LIMIT 1`;
    const { rows } = await fastify.pg.query(checkQuery, [orderId]);

    // 🔹 Si el último estado es igual al que intentamos insertar, evitar duplicaciones
    if (rows.length > 0 && rows[0].progress_status === status) {
        fastify.log.warn(`⚠️ Order ${orderId} already in status "${status}". Skipping update.`);

        let nextStatus = status === "unknown" ? "pending" :
            status === "pending" ? "cooking" :
                "ready";

        // retry update
        if (nextStatus !== "ready")
            await fastify.redis.redisPub.publish("order_updates", JSON.stringify({
                orderId,
                status: nextStatus
            }));
        return;
    }

    // 🔹 Insertar el nuevo estado solo si es válido
    const query = `INSERT INTO orders_processing (order_id, progress_status) VALUES ($1, $2) RETURNING id`;
    await fastify.pg.query(query, [orderId, status]);
    fastify.log.info(`✅ Order ${orderId} updated to status: ${status}`);
}


export async function createAndProcessOrder(fastify) {
    const client = await fastify.pg.connect();

    try {
        await client.query("BEGIN");

        // 1️⃣ Get the "unknown" recipe ID
        const recipeQuery = `SELECT id FROM recipes WHERE key_name = 'unknown' LIMIT 1`;
        const recipeResult = await client.query(recipeQuery);

        // 🛑 If no recipe found, rollback & throw an error
        if (recipeResult.rows.length === 0) {
            throw new Error("Recipe with key_name 'unknown' not found.");
        }

        const recipeId = recipeResult.rows[0].id;
        fastify.log.info(`📌 Using Recipe ID: ${recipeId}`);

        // 2️⃣ Insert order into `orders`
        const orderQuery = `INSERT INTO orders (recipe_id) VALUES ($1) RETURNING id`;
        const { rows } = await client.query(orderQuery, [recipeId]);

        const orderId = rows[0].id;
        fastify.log.info(`✅ Order created with ID: ${orderId}`);

        // 3️⃣ Insert order into `orders_processing`
        const processQuery = `INSERT INTO orders_processing (order_id, progress_status) VALUES ($1, $2) RETURNING id`;
        await client.query(processQuery, [orderId, "unknown"]);

        // 4️⃣ Commit transaction
        await client.query("COMMIT");

        return orderId;

    } catch (error) {
        // ❌ Rollback if any error occurs
        await client.query("ROLLBACK");
        fastify.log.error(`🔥 Error creating order: ${error.message}`);
        throw error;
    } finally {
        client.release();
    }
}

export async function getOrders(fastify, { limit, offset }) {
    const query = `SELECT 
        orders.id, recipes.key_name, recipes.ingredients,
        orders.created_at
        FROM orders JOIN recipes ON orders.recipe_id = recipes.id
        ORDER BY orders.created_at DESC LIMIT $1 OFFSET $2;`
    const { rows } = await fastify.pg.query(query, [limit, offset]);
    fastify.log.info(`✅ Find orders succeed`);
    return rows;
}

export async function getTotalOrders(fastify) {
    const query = `SELECT COUNT(*)::INTEGER AS total FROM orders;`
    const { rows } = await fastify.pg.query(query);
    fastify.log.info(`✅ Count orders succeed`);
    return rows[0]?.total ?? 0;
}

export async function getOrdersByStatus(fastify, { status, limit, offset }) {
    const query = `SELECT * FROM get_last_updated_orders($1) LIMIT $2 OFFSET $3;`;
    let { rows } = await fastify.pg.query(query, [status, limit, offset]);

    rows = rows.map((row) => ({
        order_id: row.order_id,
        progress_status: row.progress_status,
        last_updated: row.last_updated.toString(),
        recipe: {
            key_name: row.recipe_name,
            description: row.recipe_description,
            ingredients: row.recipe_ingredients,
            id: row.recipe_id,
            image_url: row.recipe_image
        }
    }));

    fastify.log.info(`✅ Find orders by status: "${status}" succeed`);
    return rows;
}

export async function getTotalCountOrdersByStatus(fastify, status) {
    const query = `SELECT COUNT(*)::INTEGER AS total FROM get_last_updated_orders($1)`;
    let { rows } = await fastify.pg.query(query, [status]);

    fastify.log.info(`✅ Find total count orders by status: "${status}" succeed`);
    return rows[0]?.total ?? 0;
}