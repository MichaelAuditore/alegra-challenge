import test from "node:test";
import assert from "node:assert";
import Fastify from "fastify";
import mongodbPlugin from "../../plugins/mongo.js"; // Adjust path
import { MongoMemoryServer } from "mongodb-memory-server";

test("MongoDB Plugin should register successfully", async (t) => {
    const fastify = Fastify();
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Mock config
    fastify.decorate("config", { MONGO_URI: mongoUri });

    // Register Plugin
    await fastify.register(mongodbPlugin);

    // ✅ Check if MongoDB was registered
    assert.ok(fastify.mongo);
    assert.ok(fastify.mongo.client);

    // ✅ Ensure Fastify closes properly
    t.after(() => {
        fastify.close();
        mongoServer.stop();
    });
});
