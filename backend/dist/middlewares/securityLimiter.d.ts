/**
 * Strict Rate Limiter for Authentication endpoints (Login, Password Reset)
 * Prevents brute-force, dictionary attacks, and credential stuffing.
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict Rate Limiter for Financial Transaction Triggers (STK Push, Disbursals, Withdrawals)
 * Prevents automated replay, denial-of-wallet, and spamming Safaricom Daraja gateways.
 */
export declare const paymentLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * General API Limiter for high-traffic dashboard requests
 */
export declare const generalApiLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=securityLimiter.d.ts.map