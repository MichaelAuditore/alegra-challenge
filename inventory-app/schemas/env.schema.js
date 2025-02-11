export const envSchema = {
    type: "object",
    required: ["MONGO_URI", "PURCHASE_URL"],
    properties: {
        MONGO_URI: { type: "string", default: "mongodb://127.0.0.1:27017" },
        PURCHASE_URL: { type: "string" }
    },
};