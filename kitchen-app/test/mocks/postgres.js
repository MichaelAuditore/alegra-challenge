
export default function mockPostgres(options) {
    return {
        connect: async () => {
            return { release: () => { } };
        },
        query: async () => {
            return {
                rows: options?.mockData || [ // Use mockData if provided
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
}
