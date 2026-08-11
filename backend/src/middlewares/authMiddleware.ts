import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';
import redisClient from '../redis';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing.');
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    
    // Check Redis Cache first
    const cacheKey = `user_status:${decoded.id}`;
    let cachedStatus = null;
    let cachedChamaId = null;
    let cachedRole = null;
    
    try {
      if (redisClient.isOpen) {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          cachedStatus = parsed.status;
          cachedChamaId = parsed.chamaId;
          cachedRole = parsed.role;
        }
      }
    } catch (e) {
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
        if (redisClient.isOpen) {
          await redisClient.setEx(cacheKey, 300, JSON.stringify({ status, chamaId, role }));
        }
      } catch (e) {
        // ignore cache write errors
      }
    }

    if (status === 'PENDING') {
      return res.status(403).json({ error: 'Account pending approval' });
    }
    if (status !== 'ACTIVE') {
      return res.status(403).json({ error: `Account is ${status.toLowerCase()}` });
    }
    
    (req as any).user = {
      ...decoded,
      role,
      chamaId: chamaId || null
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};
