export const envSchema = {
    type: "object",
    required: ["REDIS_URL", "PGSQL_DATABASE_URL"],
    properties: {
        REDIS_URL: { type: "string" },
        PGSQL_DATABASE_URL: { type: "string" }
    },
};