export async function createAndProcessOrder(fastify) {
    const unknownRecipeId = "d7aeb3ed-38b8-49b2-be0e-a5c8fc105bb9";
    const client = await fastify.pg.connect();

    try {
        await client.query("BEGIN");

        // 1️⃣ Insertar la orden en `orders`
        const orderQuery = `INSERT INTO orders (recipe_id) VALUES ($1) RETURNING id`;
        const { rows } = await client.query(orderQuery, [unknownRecipeId]);
        const orderId = rows[0].id;

        fastify.log.info(`✅ Order created with ID: ${orderId}`);

        // 2️⃣ Insertar la orden en `orders_processing` con estado "unknown"
        const processQuery = `INSERT INTO orders_processing (order_id, progress_status) VALUES ($1, $2) RETURNING id`;
        await client.query(processQuery, [orderId, "unknown"]);

        await client.query("COMMIT");

        return orderId;

    } catch (error) {
        // ❌ Revertir en caso de error
        await client.query("ROLLBACK");
        fastify.log.error(`Error al crear orden: ${error}`);
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