export const recipesResponseSchema = {
    tags: ["Recipes"],
    description: "Obtiene todas las recetas",
    response: {
        200: {
            type: "object",
            required: ["recipes"],
            properties: {
                recipes: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string", format: "uuid" },
                            key_name: { type: "string" },
                            description: { type: "string" },
                            image_url: { type: "string", format: "uri" },
                            ingredients: {
                                type: "object",
                                patternProperties: {
                                    "^.*$": { type: "integer", minimum: 1 }
                                },
                                additionalProperties: true
                            }
                        },
                        required: ["id", "key_name", "description", "ingredients", "image_url"]
                    }
                }
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