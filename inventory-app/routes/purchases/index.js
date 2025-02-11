import { purchasesSchema } from "../../schemas/purchase.schema.js";
import { getPurchases } from "../../services/purchase.js";

export default async function (fastify, opts) {
    const collection = fastify.mongo.db.collection("purchases");

    fastify.get("/",
        { schema: purchasesSchema },
        async function (request, reply) {
            try {
                const { limit = '5', offset = '0' } = request.query;
                const { purchases, total } = await getPurchases(collection, { limit, offset });
                console.log(purchases);
                console.log(total);
                return { purchases, total };
            } catch (error) {
                fastify.log.error(error);
                return reply.code(500).send({ error: "Error getting ingredients" });
            }
        });
}
