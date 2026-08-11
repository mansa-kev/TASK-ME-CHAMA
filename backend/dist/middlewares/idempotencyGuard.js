"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyGuard = void 0;
// In-memory cache for idempotency tokens (backed by timestamp for garbage collection)
// In production clusters, this can be backed by Redis.
const idempotencyStore = new Map();
// Purge entries older than 24 hours every hour
setInterval(() => {
    const now = Date.now();
    const ttl = 24 * 60 * 60 * 1000;
    for (const [key, value] of idempotencyStore.entries()) {
        if (now - value.timestamp > ttl) {
            idempotencyStore.delete(key);
        }
    }
}, 60 * 60 * 1000);
/**
 * Ensures financial mutations (loan payouts, disbursements, fee settlements) are executed exactly once
 * even if duplicate requests are triggered by network retries or multiple clicks.
 */
const idempotencyGuard = (req, res, next) => {
    const idempotencyKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']);
    if (!idempotencyKey) {
        return next(); // Key is optional for read or standard operations, but enforced on critical financial routes
    }
    if (idempotencyStore.has(idempotencyKey)) {
        const cached = idempotencyStore.get(idempotencyKey);
        return res.status(cached.status).json({
            ...cached.response,
            _idempotentReplay: true
        });
    }
    // Intercept json response to cache it
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            idempotencyStore.set(idempotencyKey, {
                response: body,
                status: res.statusCode,
                timestamp: Date.now()
            });
        }
        return originalJson(body);
    };
    next();
};
exports.idempotencyGuard = idempotencyGuard;
//# sourceMappingURL=idempotencyGuard.js.map