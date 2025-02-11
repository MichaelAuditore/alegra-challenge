export const envSchema = {
    type: "object",
    required: ["REDIS_URL", "PGSQL_DATABASE_URL", "WS_INVENTORY"],
    properties: {
        REDIS_URL: {
            type: "string",
            default: "redis://mock-redis:6379"
        },
        PGSQL_DATABASE_URL: {
            type: "string",
            default: "127.0.0.1:3306"
        },
        WS_INVENTORY: {
            type: "string",
            default: "127.0.0.1:3002"
        }
    }
};