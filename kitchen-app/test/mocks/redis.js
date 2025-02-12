export const redisMock = {
    redisPub: {
        storage: {},

        async publish(channel, message) {
            if (!this.storage[channel]) {
                this.storage[channel] = [];
            }
            this.storage[channel].push(message);
        }
    },

    redisSub: {
        storage: {},
        listeners: {},

        async subscribe(channel) {
            if (!this.storage[channel]) {
                this.storage[channel] = [];
            }
            if (!this.listeners[channel]) {
                this.listeners[channel] = [];
            }
        },

        on(event, callback) {
            if (event !== "message") return;
            this.listeners[event] = callback;
        },

        emit(channel, message) {
            if (this.listeners["message"]) {
                this.listeners["message"](channel, message);
            }
        }
    },

    async quit() {
        this.pub.storage = {};
        this.sub.storage = {};
        this.sub.listeners = {};
        return Promise.resolve();
    }
};
