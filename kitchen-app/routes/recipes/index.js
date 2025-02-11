import { recipesResponseSchema } from "../../schemas/recipes.schema.js";
import { getAllRecipes } from "../../services/recipe.js";

export default async function (fastify, opts) {
    fastify.get("/",
        { schema: recipesResponseSchema },
        async function (request, reply) {
            try {
                const recipes = await getAllRecipes(fastify);
                return reply.code(200).send({ recipes });
            } catch (error) {
                fastify.log.error("🔥 Error fetching recipes:", error);
                return reply.code(500).send({
                    error: "Failed to retrieve recipes",
                    details: error.message
                });
            }
        })
}
