"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const prisma_1 = require("../prisma");
const zod_1 = require("zod");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
    role: zod_1.z.string().optional(),
    idNumber: zod_1.z.string().optional(),
    kraPin: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    nextOfKinName: zod_1.z.string().optional(),
    nextOfKinRelation: zod_1.z.string().optional(),
    nextOfKinPhone: zod_1.z.string().optional(),
    inviteCode: zod_1.z.string()
});
const register = async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
        }
        const { email, password, name, role, idNumber, kraPin, gender, dateOfBirth, phone, address, nextOfKinName, nextOfKinRelation, nextOfKinPhone, inviteCode } = parsed.data;
        const existingUser = await prisma_1.prisma.user.findFirst({
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
        const chama = await prisma_1.prisma.chama.findUnique({ where: { registration: lookupCode } });
        if (!chama) {
            return res.status(400).json({ error: 'Invalid or non-existent Invite Code' });
        }
        const resolvedChamaId = chama.id;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
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
        const token = jwt_simple_1.default.encode({ id: user.id, role: user.role }, JWT_SECRET);
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
const login = async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
        }
        const { email, password } = parsed.data;
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                email: { equals: email, mode: 'insensitive' }
            }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.status === 'PENDING') {
            return res.status(403).json({ error: 'Account pending approval' });
        }
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ error: `Account is ${user.status.toLowerCase()}` });
        }
        const token = jwt_simple_1.default.encode({ id: user.id, role: user.role }, JWT_SECRET);
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email, requiresPasswordChange: user.requiresPasswordChange } });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(6)
});
const changePassword = async (req, res) => {
    try {
        const userPayload = req.user;
        if (!userPayload) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const parsed = changePasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
        }
        const { oldPassword, newPassword } = parsed.data;
        const dbUser = await prisma_1.prisma.user.findUnique({ where: { id: userPayload.id } });
        if (!dbUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = await bcryptjs_1.default.compare(oldPassword, dbUser.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid current password' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id: dbUser.id },
            data: {
                password: hashedPassword,
                requiresPasswordChange: false
            }
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.js.map