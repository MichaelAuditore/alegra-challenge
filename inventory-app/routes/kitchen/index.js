import { handleKitchenRequest } from "../../services/inventory.js";

export default async function (fastify, opts) {
    function monitorMessages(socket) {
        socket.on("message", async (data) => {
            const message = JSON.parse(data.toString());
            try {
                await handleKitchenRequest(fastify, message);

                console.log("Message Received in Socket");

                socket.send(JSON.stringify({ message: "Solicitud procesada", status: true }));
            } catch (error) {
                fastify.log.error(`Error al procesar la solicitud de productos: ${error}`);
                socket.send(JSON.stringify({ message: error.message, status: false }));
            }
        });
    }

    fastify.get("/recipe-ingredients",
        { websocket: true },
        async (socket) => monitorMessages(socket)
    );

}
