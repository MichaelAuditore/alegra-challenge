export const ordersPostSchema = {
    tags: ["orders"],
    description: "Recibe una nueva orden de comida",
    body: {
        type: "object",
        required: ["customer"],
        properties: {
            customer: { type: "string", description: "Nombre del cliente" }
        }
    },
    response: {
        201: {
            type: "object",
            properties: {
                orderId: { type: "string", format: "uuid", description: "Identificador único" },
                customer: { type: "string" },
                message: { type: "string" }
            }
        },
        500: {
            type: "object",
            properties: {
                error: { type: "string" },
            }
        }
    }
};

export const ordersGetSchema = {
    tags: ["Orders"],
    description: "obtiene ordenes con su respectivo estado",
    response: {
        200: {
            type: "object",
            properties: {
                orders: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string", format: "uuid" },
                            key_name: { type: "string" },
                            ingredients: {
                                type: "object",
                                patternProperties: {
                                    "^.*$": { type: "integer", minimum: 1 }
                                },
                                additionalProperties: true
                            }
                        }
                    }
                },
                total: { type: "number" }
            }
        }
    }
}

export const ordersByStatusSchema = {
    tags: ["Orders"],
    description: "obtiene ordenes con su respectivo estado",
    params: {
        type: 'object',
        properties: {
            status: {
                type: 'string',
                enum: ['pending', 'cooking', 'ready', 'unknown']
            }
        },
        required: ['status']
    },
    querystring: {
        type: "object",
        properties: {
            limit: { type: "integer", minimum: 1, default: 5 },
            offset: { type: "integer", minimum: 0, default: 0 },
        }
    },
    response: {
        200: {
            type: "object",
            properties: {
                orders: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            order_id: { type: "string", format: "uuid" },
                            progress_status: { type: "string" },
                            last_updated: { type: "string" },
                            recipe: {
                                type: "object",
                                properties: {
                                    id: { type: "string", format: "uuid" },
                                    key_name: { type: "string" },
                                    description: { type: "string" },
                                    image_url: { type: "string" },
                                    ingredients: {
                                        type: "object",
                                        patternProperties: {
                                            "^.*$": { type: "integer", minimum: 1 }
                                        },
                                        additionalProperties: true
                                    }

                                }
                            }
                        }
                    }
                },
                total: { type: "number" }
            }
        }
    }
}

export const ordersTotalCountSchema = {
    tags: ["Orders"],
    description: "obtiene total de ordenes por estado",
    response: {
        200: {
            type: "object",
            properties: {
                status: { type: "string" },
                count: { type: "integer" }
            }
        }
    }
}