import { build as buildApplication } from "fastify-cli/helper.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

// This file contains code that we reuse
// between our tests.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AppPath = path.join(__dirname, "..", "app.js");

// Fill in this config with all the configurations
// needed for testing the application
export function config() {
  return {
    redisUrl: "mockRedis://127.0.0.1:6379",
    skipOverride: true // Register our application with fastify-plugin
  }
}

// automatically build and tear down our instance
export async function build(t) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath]

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await buildApplication(argv, config());

  return app;
}