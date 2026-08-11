import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../redis';

// Check if redisClient is connected, otherwise fallback to memory store
const getStore = () => {
  return new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  });
};

/**
 * Strict Rate Limiter for Authentication endpoints (Login, Password Reset)
 * Prevents brute-force, dictionary attacks, and credential stuffing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  message: {
    error: 'Too many login attempts. For security reasons, please try again in 15 minutes.'
  }
});

/**
 * Strict Rate Limiter for Financial Transaction Triggers (STK Push, Disbursals, Withdrawals)
 * Prevents automated replay, denial-of-wallet, and spamming Safaricom Daraja gateways.
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 transaction requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  message: {
    error: 'Transaction rate limit exceeded. Please wait a moment before trying again.'
  }
});

/**
 * General API Limiter for high-traffic dashboard requests
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // Accommodates multi-card dashboards
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  message: {
    error: 'API rate limit exceeded. Please slow down your requests.'
  }
});
