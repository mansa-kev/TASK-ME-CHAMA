import { Request, Response, NextFunction } from 'express';

// In-memory cache for idempotency tokens (backed by timestamp for garbage collection)
// In production clusters, this can be backed by Redis.
const idempotencyStore = new Map<string, { response: any; status: number; timestamp: number }>();

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
export const idempotencyGuard = (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string;

  if (!idempotencyKey) {
    return next(); // Key is optional for read or standard operations, but enforced on critical financial routes
  }

  if (idempotencyStore.has(idempotencyKey)) {
    const cached = idempotencyStore.get(idempotencyKey)!;
    return res.status(cached.status).json({
      ...cached.response,
      _idempotentReplay: true
    });
  }

  // Intercept json response to cache it
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
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
