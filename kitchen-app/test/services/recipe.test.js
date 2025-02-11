import assert from "node:assert";
import { test } from "node:test";
import { getAllRecipes, getRandomRecipe } from "../../services/recipe.js";

// 📌 Mock PostgreSQL
const mockPg = {
    query: async (query) => {
        if (query.includes("ORDER BY key_name ASC")) {
            return {
                rows: [
                    { id: crypto.randomUUID(), key_name: "Apple Pie" },
                    { id: crypto.randomUUID(), key_name: "Banana Bread" },
                    { id: crypto.randomUUID(), key_name: "Chocolate Cake" },
                ]
            };
        }
        if (query.includes("ORDER BY RANDOM() LIMIT 1")) {
            return { rows: [{ id: crypto.randomUUID(), key_name: "Ice Cream" }] };
        }
        return { rows: [] };
    }
};

// 📌 Fastify Mock Setup
async function buildFastify() {
    const fastify = { pg: mockPg };
    return fastify;
}

// 📌 Test `getAllRecipes`
test("getAllRecipes - returns all recipes sorted by name", async () => {
    const fastify = await buildFastify();
    const recipes = await getAllRecipes(fastify);

    assert.strictEqual(recipes.length, 3, "Should return 3 recipes");
    assert.strictEqual(recipes[0].key_name, "Apple Pie", "First recipe should be 'Apple Pie'");
    assert.strictEqual(recipes[1].key_name, "Banana Bread", "Second recipe should be 'Banana Bread'");
    assert.strictEqual(recipes[2].key_name, "Chocolate Cake", "Third recipe should be 'Chocolate Cake'");
});

// 📌 Test `getRandomRecipe`
test("getRandomRecipe - returns a single random recipe", async () => {
    const fastify = await buildFastify();
    const recipe = await getRandomRecipe(fastify);

    console.log(JSON.stringify(recipe));

    assert.ok(recipe, "Ice Cream");
    assert.strictEqual(recipe.key_name, "Ice Cream", "The random recipe should be 'Ice Cream'");
});
