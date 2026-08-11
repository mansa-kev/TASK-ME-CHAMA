"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMember = exports.getMembers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../prisma");
const getMembers = async (req, res) => {
    try {
        const user = req.user;
        const dbUser = await prisma_1.prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser?.chamaId && user.role !== 'TCM_SUPER_ADMIN') {
            return res.status(403).json({ error: 'User is not assigned to a Chama' });
        }
        const members = await prisma_1.prisma.user.findMany({
            where: user.role === 'TCM_SUPER_ADMIN' ? {} : { chamaId: dbUser?.chamaId },
            include: { ledger: { include: { transactions: true } } }
        });
        res.json(members);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMembers = getMembers;
const createMember = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = req.user;
        const dbUser = await prisma_1.prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser?.chamaId) {
            return res.status(400).json({ error: 'Admin must belong to a Chama to create members' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newMember = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'MEMBER',
                chamaId: dbUser.chamaId,
                ledger: {
                    create: {
                        chamaId: dbUser.chamaId,
                        savingsBalance: 0,
                        sharesBalance: 0,
                        activeLoanBalance: 0,
                    }
                }
            },
            include: { ledger: true }
        });
        res.status(201).json(newMember);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createMember = createMember;
//# sourceMappingURL=member.js.map