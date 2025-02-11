import { healthSchema } from "../schemas/health.schema.js";

export default async function (fastify, opts) {
  fastify.get("/health",
    { schema: healthSchema },
    async function (request, reply) {
      return reply.code(200).send({
        status: "OK",
        uptime: process.uptime(),
        redisRegistered: !!fastify.redis,
        postgresRegistered: !!fastify.pg,
        timestamp: new Date().toISOString()
      });
    })
}
