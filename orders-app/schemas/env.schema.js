export const envSchema = {
    type: "object",
    required: ["REDIS_URL", "PGSQL_DATABASE_URL"],
    properties: {
        REDIS_URL: { type: "string", default: "redis://mock-redis:6379" },
        PGSQL_DATABASE_URL: { type: "string" }
    },
};