export const healthSchema = {
    tags: ["Health"],
    description: "Verifica si el servicio está funcionando",
    response: {
        200: {
            type: "object",
            properties: {
                status: { type: "string" },
                uptime: { type: "number" },
                timestamp: { type: "string" },
                mongoRegistered: { type: "boolean" },
            }
        }
    }
};