"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
// Use external Redis if provided, else attempt local default (for fallback/dev)
const REDIS_URL = process.env.REDIS_URL;
exports.redisClient = (0, redis_1.createClient)({
    url: REDIS_URL
});
exports.redisClient.on('error', (err) => console.log('Redis Client Error', err));
exports.redisClient.on('connect', () => console.log('Redis Client Connected'));
// Connect asynchronously but don't block the module export
exports.redisClient.connect().catch(console.error);
exports.default = exports.redisClient;
//# sourceMappingURL=redis.js.map