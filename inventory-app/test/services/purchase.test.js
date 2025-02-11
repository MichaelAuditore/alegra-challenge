import Fastify from 'fastify';
import nock from 'nock';
import assert from 'node:assert';
import { test } from 'node:test';
import { purchaseIngredient } from '../../services/purchase.js';

test("Test purchaseIngredient function", async (t) => {
    const fastify = Fastify();
    fastify.decorate("config", { PURCHASE_URL: "http://mock-api.com/purchase" });

    // Mock API response for the purchase call
    const mockApi = nock("http://mock-api.com")
        .get("/purchase")
        .query({ ingredient: "potato" })
        .reply(200, { quantitySold: 0 });

    const mockApiRetry = nock("http://mock-api.com")
        .get("/purchase")
        .query({ ingredient: "potato" })
        .reply(200, { quantitySold: 10 });

    const quantity = await purchaseIngredient(fastify, "potato");

    assert.strictEqual(quantity, 10);

    mockApi.done();
    mockApiRetry.done();

    t.after(() => fastify.close());
});

test("Test purchaseIngredient function with retry logic", async (t) => {
    const fastify = Fastify();
    fastify.decorate("config", { PURCHASE_URL: "http://mock-api.com/purchase" });

    // Mock the first API response (no units sold)
    const mockApiFirstCall = nock("http://mock-api.com")
        .get("/purchase")
        .query({ ingredient: "potato" })
        .reply(200, { quantitySold: 0 });  // Simulate no units sold initially

    // Mock the second API response (successful purchase)
    const mockApiSecondCall = nock("http://mock-api.com")
        .get("/purchase")
        .query({ ingredient: "potato" })
        .reply(200, { quantitySold: 10 });  // Simulate a successful purchase on retry

    // Track when the function actually waits (without needing to wait 15 seconds)
    const start = Date.now();

    // Call the purchaseIngredient function with the ingredient "potato"
    const quantity = await purchaseIngredient(fastify, "potato");

    const end = Date.now();

    // Assert that the correct quantity was returned after retry
    assert.strictEqual(quantity, 10, "Expected quantity to be 10 after retry.");

    // Ensure that the API was called twice: once with 0 and once with 10
    mockApiFirstCall.done();
    mockApiSecondCall.done();

    // Assert that at least 15 seconds have passed between the two calls (retry delay)
    assert.ok(end - start >= 15000, "Expected at least 15 seconds of delay.");

    // Cleanup after the test
    t.after(() => fastify.close());
});
