import { inventoriesSchema } from "../../schemas/inventory.schema.js";
import { getAllIngredients } from "../../services/inventory.js";

export default async function (fastify, opts) {
  const collection = fastify.mongo.db.collection("ingredients");

  fastify.get("/", { schema: inventoriesSchema }, async function (request, reply) {
    try {
      const inventory = await getAllIngredients(collection);
      return { inventory };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Error getting ingredients" });
    }
  });
}
