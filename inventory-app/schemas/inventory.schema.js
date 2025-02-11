export const inventoriesSchema = {
    tags: ["Inventory"],
    description: "Obtiene todos los ingredientes del inventario por nombre",
    response: {
        200: {
            type: "object",
            required: ["inventory"],
            properties: {
                inventory: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            _id: {
                                type: "string",
                                description: "identificador único"
                            },
                            key_name: { type: "string" },
                            stock: { type: "number" },
                            image_url: { type: "string" }
                        }
                    }
                }
            }
        }
    }
};