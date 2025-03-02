import fastifyAutoload from "@fastify/autoload";
import Fastify from "fastify";
import { fileURLToPath } from "node:url";
import path from "node:path";

import mockPostgres from "./mocks/postgres.js";
import { mockRedis } from "./mocks/redis.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp() {
  const app = Fastify();
  app.decorate('config', { REDIS_URL: "mock://default", PGSQL_DATABASE_URL: "mock://pg.database:3000" });
  app.decorate('redis', mockRedis);
  app.decorate('pg', mockPostgres());

  // Asegurar que los mocks tengan la estructura correcta
  if (!app.redis.redisPub || !app.redis.redisSub) {
    throw new Error("❌ mockRedis no tiene las propiedades necesarias.");
  }
  if (!app.pg.query) {
    throw new Error("❌ mockPostgres no tiene la función query.");
  }

  app.register(fastifyAutoload, {
    dir: path.resolve(__dirname, "../routes"),
    options: Object.assign({
      prefix: "api/v1"
    }),
  });

  await app.ready();

  return app;
}
