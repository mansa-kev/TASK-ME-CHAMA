"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = void 0;
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const redis_1 = __importDefault(require("../redis"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing.');
}
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt_simple_1.default.decode(token, JWT_SECRET);
        // Check Redis Cache first
        const cacheKey = `user_status:${decoded.id}`;
        let cachedStatus = null;
        let cachedChamaId = null;
        let cachedRole = null;
        try {
            if (redis_1.default.isOpen) {
                const cachedData = await redis_1.default.get(cacheKey);
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    cachedStatus = parsed.status;
                    cachedChamaId = parsed.chamaId;
                    cachedRole = parsed.role;
                }
            }
        }
        catch (e) {
            console.warn('Redis cache read failed, falling back to DB', e);
        }
        let status = cachedStatus;
        let chamaId = cachedChamaId;
        let role = cachedRole || decoded.role;
        if (!status) {
            const { prisma } = require('../prisma');
            const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (!dbUser) {
                return res.status(401).json({ error: 'User not found' });
            }
            status = dbUser.status;
            chamaId = dbUser.chamaId;
            role = dbUser.role;
            // Update Cache (expire in 5 minutes to keep it fresh enough)
            try {
                if (redis_1.default.isOpen) {
                    await redis_1.default.setEx(cacheKey, 300, JSON.stringify({ status, chamaId, role }));
                }
            }
            catch (e) {
                // ignore cache write errors
            }
        }
        if (status === 'PENDING') {
            return res.status(403).json({ error: 'Account pending approval' });
        }
        if (status !== 'ACTIVE') {
            return res.status(403).json({ error: `Account is ${status.toLowerCase()}` });
        }
        req.user = {
            ...decoded,
            role,
            chamaId: chamaId || null
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=authMiddleware.js.map