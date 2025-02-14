import {
  ordersByStatusSchema,
  ordersGetSchema,
  ordersPostSchema
} from "../../schemas/orders.schema.js";
import {
  createAndProcessOrder,
  getOrders,
  getOrdersByStatus,
  getTotalCountOrdersByStatus,
  getTotalOrders
} from "../../services/orders.js";

export default async function (fastify, opts) {
  fastify.get("/",
    { schema: ordersGetSchema },
    async function (request, reply) {
      try {
        const { limit = '5', offset = '0' } = request.query;
        const orders = await getOrders(fastify, { limit, offset });
        fastify.log.info(`Orders: ${JSON.stringify(orders)}`);
        const totalOrders = await getTotalOrders(fastify);
        return reply.code(200).send({ orders, total: totalOrders });
      } catch (error) {
        fastify.log.error(`🔥 Error fetching orders: ${error}`);
        return reply.code(500).send({
          error: "Failed to retrieve orders",
          details: error.message
        });
      }
    })

  fastify.get("/:status",
    { schema: ordersByStatusSchema },
    async function (request, reply) {
      try {
        const status = request.params.status;
        const { limit = '5', offset = '0' } = request.query;
        const orders = await getOrdersByStatus(fastify, { status, limit, offset });
        const totalOrders = await getTotalCountOrdersByStatus(fastify, status);
        return reply.code(200).send({ orders, total: totalOrders });
      } catch (error) {
        fastify.log.error("🔥 Error fetching orders:", error);
        return reply.code(500).send({
          error: "Failed to retrieve orders",
          details: error.message
        });
      }
    })

  fastify.post("/",
    { schema: ordersPostSchema },
    async function (request, reply) {
      try {
        const customer = request.body?.customer || "default-user";

        const orderId = await createAndProcessOrder(fastify);

        if (orderId) {
          // 📢 Publicar en Redis para que cocina la tome
          await fastify.redis.redisPub.publish("new_order", JSON.stringify({
            orderId,
            status: "unknown"
          }));
        }

        return reply.code(201).send({
          message: "Orden enviada a la cocina exitosamente.",
          orderId,
          customer
        });
      } catch (error) {
        return reply.code(500).send({ error: "It doesn't process the order" });
      }
    })
}
