import { IoAdapter } from '@nestjs/platform-socket.io';
import type { INestApplication } from '@nestjs/common';
import type { ServerOptions } from 'socket.io';
export declare class RedisIoAdapter extends IoAdapter {
    private adapterConstructor;
    connectToRedis(): Promise<void>;
    createIOServer(port: number, options?: ServerOptions): any;
}
export declare function useRedisIoAdapter(app: INestApplication): Promise<void>;
