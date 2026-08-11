"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalApiLimiter = exports.paymentLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Strict Rate Limiter for Authentication endpoints (Login, Password Reset)
 * Prevents brute-force, dictionary attacks, and credential stuffing.
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Max 10 attempts per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many login attempts. For security reasons, please try again in 15 minutes.'
    }
});
/**
 * Strict Rate Limiter for Financial Transaction Triggers (STK Push, Disbursals, Withdrawals)
 * Prevents automated replay, denial-of-wallet, and spamming Safaricom Daraja gateways.
 */
exports.paymentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Max 10 transaction requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Transaction rate limit exceeded. Please wait a moment before trying again.'
    }
});
/**
 * General API Limiter for high-traffic dashboard requests
 */
exports.generalApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1500, // Accommodates multi-card dashboards
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'API rate limit exceeded. Please slow down your requests.'
    }
});
//# sourceMappingURL=securityLimiter.js.map