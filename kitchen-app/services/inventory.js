import websocket from "ws";

export async function requestIngredients(fastify, protocol, { ingredients }) {

    return new Promise((resolve, reject) => {
        const ws = new websocket(`${protocol}://${fastify.config.WS_INVENTORY}/v1/kitchen/recipe-ingredients`);

        ws.on("open", () => {
            fastify.log.info("✅ WebSocket connected to Inventory");
            ws.send(JSON.stringify(ingredients));
        });

        ws.once("message", (response) => {
            const data = JSON.parse(response.toString());
            fastify.log.info(`📩 ${data.message}`);

            resolve(data);
            ws.close();
        });

        ws.on("error", (error) => {
            fastify.log.error(`❌ ${error}`);
            reject(error);
        });

        ws.on("close", () => {
            fastify.log.info("🔒 WebSocket closed");
        });
    });
}