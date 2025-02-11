export async function getAllRecipes(fastify) {
    const query = `SELECT * FROM recipes WHERE key_name != 'unknown' ORDER BY key_name ASC;`;
    const { rows } = await fastify.pg.query(query);
    return rows;
}

export async function getRandomRecipe(fastify) {
    const query = `SELECT * FROM recipes
        WHERE key_name != 'unknown'
        ORDER BY RANDOM() LIMIT 1;`;
    const { rows } = await fastify.pg.query(query);
    return rows[0];
}