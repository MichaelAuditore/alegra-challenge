import path from "node:path";
import { fileURLToPath } from "node:url";

import AutoLoad from "@fastify/autoload";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import websocket from "@fastify/websocket";

import { envSchema } from "./schemas/env.schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pass --options via CLI arguments in command to enable these options.
export const options = { port: process.env.PORT }

const envOptions = {
  confKey: "config",
  schema: envSchema,
  dotenv: true
}

export default async function (fastify, opts) {
  // Register CORS  
  fastify.register(cors, {});
  // Register Websocket
  fastify.register(websocket, {});

  fastify.register(fastifyEnv, envOptions);


  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts)
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({
      prefix: "inventory-service/v1"
    }, opts),
  })
}
