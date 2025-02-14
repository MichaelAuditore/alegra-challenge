export const mockRedis = {
    redisPub: {
        publish: async (channel, message) => {
            console.log(`📢 Mock Publish: ${channel} -> ${message}`);
        }
    },
    redisSub: {
        subscribe: async (channel, callback) => {
            console.log(`📡 Mock Subscribed to ${channel}`);
            if (channel === "order_updates") {
                setTimeout(() => {
                    callback(null, 1);
                }, 10);
            }
        },
        on: (event, handler) => {
            console.log(`🛑 Mock listening for event: ${event}`);
            if (event === "message") {
                setTimeout(() => {
                    const mockMessage = JSON.stringify({ orderId: "123", status: "pending", recipeId: "456" });
                    handler("order_updates", mockMessage);
                }, 100);
            }
        }
    }
};
