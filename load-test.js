const API_URL = "http://localhost:3000/orders/";
const TOTAL_REQUESTS = 200;

async function sendOrderRequest(orderNumber) {
    const body = JSON.stringify({ customer: "Manager" });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body,
        });

        if (!response.ok) {
            throw new Error(`❌ Request #${orderNumber} failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Request #${orderNumber} success:`, data);
        return data;
    } catch (error) {
        console.error(`🚨 Request #${orderNumber} error:`, error.message);
    }
}

async function runLoadTest() {
    console.log(`🚀 Sending ${TOTAL_REQUESTS} requests to ${API_URL}...`);

    const startTime = Date.now();

    // Ejecutar todas las peticiones en paralelo
    await Promise.all(
        Array.from({ length: TOTAL_REQUESTS }, (_, i) => sendOrderRequest(i + 1))
    );

    const endTime = Date.now();
    console.log(`⏳ Test completed in ${(endTime - startTime) / 1000} seconds.`);
}

runLoadTest();
