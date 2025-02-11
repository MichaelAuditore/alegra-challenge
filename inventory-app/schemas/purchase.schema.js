export const purchasesSchema = {
    tags: ["Purchases"],
    description: "Obtiene las compras realizadas por bodega de alimentos",
    querystring: {
        type: "object",
        properties: {
            limit: { type: "integer", minimum: 1, default: 5 },
            offset: { type: "integer", minimum: 0, default: 0 },
        },
        required: ["limit", "offset"]
    },
    response: {
        200: {
            type: "object",
            properties: {
                purchases: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            key_name: { type: "string", minLength: 1 },
                            purchasedStock: { type: "number", minimum: 0 },
                            purchasedDate: { type: "string", format: "date-time" } // ISO 8601
                        },
                        required: ["key_name", "purchasedStock", "purchasedDate"]
                    }
                },
                total: { type: "integer", minimum: 0 }
            },
            required: ["purchases", "total"]
        }
    }
};
