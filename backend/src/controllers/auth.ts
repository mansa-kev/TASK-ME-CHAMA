import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple';
import { prisma } from '../prisma';
import { z } from 'zod';
import redisClient from '../redis';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.string().optional(),
  idNumber: z.string().optional(),
  kraPin: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinRelation: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  inviteCode: z.string()
});

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }
    const { 
      email, password, name, role, 
      idNumber, kraPin, gender, dateOfBirth, 
      phone, address, nextOfKinName, 
      nextOfKinRelation, nextOfKinPhone,
      inviteCode
    } = parsed.data;

    const existingUser = await prisma.user.findFirst({ 
      where: { 
        email: { equals: email, mode: 'insensitive' } 
      } 
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    if (!inviteCode || inviteCode.trim() === '') {
      return res.status(400).json({ error: 'Invite Code is required' });
    }

    let resolvedRole = 'MEMBER';
    let lookupCode = inviteCode.trim();

    if (lookupCode.toUpperCase().startsWith('ADMIN-')) {
      resolvedRole = 'CHAMA_ADMIN';
      lookupCode = lookupCode.substring(6); // strip 'ADMIN-'
    }

    const chama = await prisma.chama.findUnique({ where: { registration: lookupCode } });
    if (!chama) {
      return res.status(400).json({ error: 'Invalid or non-existent Invite Code' });
    }
    const resolvedChamaId = chama.id;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: resolvedRole,
        idNumber,
        kraPin,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        phone,
        address,
        nextOfKinName,
        nextOfKinRelation,
        nextOfKinPhone,
        status: 'PENDING',
        chamaId: resolvedChamaId
      },
    });

    const token = jwt.encode({ id: user.id, role: user.role }, JWT_SECRET);

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findFirst({ 
      where: { 
        email: { equals: email, mode: 'insensitive' } 
      } 
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'PENDING') {
      return res.status(403).json({ error: 'Account pending approval' });
    }
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: `Account is ${user.status.toLowerCase()}` });
    }

    const token = jwt.encode({ id: user.id, role: user.role }, JWT_SECRET);

    if (redisClient.isOpen) {
      await redisClient.del(`user_status:${user.id}`);
    }

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email, requiresPasswordChange: user.requiresPasswordChange } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6)
});

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userPayload = (req as any).user;
    if (!userPayload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }
    const { oldPassword, newPassword } = parsed.data;

    const dbUser = await prisma.user.findUnique({ where: { id: userPayload.id } });
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        password: hashedPassword,
        requiresPasswordChange: false
      }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
