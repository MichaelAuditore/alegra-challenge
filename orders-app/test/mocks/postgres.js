
export default function mockPostgres(options) {
    return {
        connect: async () => {
            return {
                query: async (query, params) => {
                    // Simular la ejecución de una consulta
                    if (query === "BEGIN") {
                        return {}; // Simula la respuesta de BEGIN
                    }

                    if (query === "COMMIT") {
                        return {}; // Simula la respuesta de COMMIT
                    }

                    if (query === "ROLLBACK") {
                        return {}; // Simula la respuesta de ROLLBACK
                    }

                    if (query.startsWith("SELECT id FROM recipes WHERE key_name = 'unknown'")) {
                        // Simula una respuesta vacía (no se encuentra la receta)
                        return { rows: [{ id: crypto.randomUUID(), "key_name": "unknown" }] };
                    }

                    if (query.startsWith("INSERT INTO orders (recipe_id)")) {
                        // Simula una inserción de un pedido y retorna un ID de orden
                        return { rows: [{ id: 1 }] };
                    }

                    if (query.startsWith("INSERT INTO orders_processing (order_id, progress_status)")) {
                        // Simula la inserción en la tabla `orders_processing`
                        return { rows: [{ id: 1 }] };
                    }

                    throw new Error(`Unhandled query: ${query}`);
                },
                release: () => { }
            }
        },
        query: async (query) => {
            if (query.includes("SELECT COUNT(*):")) {
                return { rows: [{ total: 1 }] }; // Simula la respuesta de COMMIT
            }
            if (query.includes("SELECT * FROM get_last_updated_orders($1)")) {
                return {
                    rows: [{
                        order_id: crypto.randomUUID(),
                        progress_status: "pending",
                        recipe: {},
                        last_updated: new Date().toString()
                    }]
                };
            }
            return {
                rows: options?.mockData || [
                    {
                        id: crypto.randomUUID(),
                        key_name: "pizza",
                        description: "pizza_description",
                        image_url: "http://example.com/pizza.png",
                        ingredients: { cheese: 1, tomato: 3 }
                    },
                    {
                        id: crypto.randomUUID(),
                        key_name: "french_fries",
                        description: "french_fries_description",
                        image_url: "http://example.com/fries.png",
                        ingredients: { ketchup: 1, potato: 3 }
                    }
                ]
            };
        },
        end: async () => Promise.revolve()
    };
};
