"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
exports.useRedisIoAdapter = useRedisIoAdapter;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    adapterConstructor = null;
    async connectToRedis() {
        const url = process.env.REDIS_URL?.trim();
        if (!url)
            return;
        const pubClient = (0, redis_1.createClient)({ url });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        this.adapterConstructor = (0, redis_adapter_1.createAdapter)(pubClient, subClient);
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        if (this.adapterConstructor) {
            server.adapter(this.adapterConstructor);
        }
        return server;
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
async function useRedisIoAdapter(app) {
    if (!process.env.REDIS_URL?.trim())
        return;
    const adapter = new RedisIoAdapter(app);
    await adapter.connectToRedis();
    app.useWebSocketAdapter(adapter);
}
//# sourceMappingURL=redis-io.adapter.js.map