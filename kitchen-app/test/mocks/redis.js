export default {
    storage: {},

    async rpush(queueName, message) {
        if (!this.storage[queueName]) {
            this.storage[queueName] = [];
        }
        this.storage[queueName].push(message);
    },

    async lpop(queueName) {
        return this.storage[queueName]?.shift() || null;
    },

    async quit() {
        this.storage = {};
        return Promise.resolve();
    }
};
