"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = require("./prisma");
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = __importDefault(require("./routes/auth"));
const member_1 = __importDefault(require("./routes/member"));
const ledger_1 = __importDefault(require("./routes/ledger"));
const stats_1 = __importDefault(require("./routes/stats"));
const chamas_1 = __importDefault(require("./routes/chamas"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const submodules_1 = __importDefault(require("./routes/submodules"));
const loans_1 = __importDefault(require("./routes/loans"));
const settings_data_1 = __importDefault(require("./routes/settings-data"));
const reports_1 = __importDefault(require("./routes/reports"));
const operations_1 = __importDefault(require("./routes/operations"));
const payments_1 = __importDefault(require("./routes/payments"));
const officials_1 = __importDefault(require("./routes/officials"));
const saas_1 = __importDefault(require("./routes/saas"));
const bylaws_1 = __importDefault(require("./routes/bylaws"));
const idempotencyGuard_1 = require("./middlewares/idempotencyGuard");
const securityLimiter_1 = require("./middlewares/securityLimiter");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-chama-id', 'idempotency-key', 'x-idempotency-key']
}));
app.use(express_1.default.json());
app.use(idempotencyGuard_1.idempotencyGuard);
// Rate Limiting
app.use('/api/', securityLimiter_1.generalApiLimiter);
app.use('/api/auth', auth_1.default);
app.use('/api/saas', saas_1.default);
app.use('/api/bylaws', bylaws_1.default);
app.use('/api/members', member_1.default);
app.use('/api/ledgers', ledger_1.default);
app.use('/api/stats', stats_1.default);
app.use('/api/chamas', chamas_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api', submodules_1.default);
app.use('/api/loans', loans_1.default);
app.use('/api/settings-data', settings_data_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/operations', operations_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/officials', officials_1.default);
// File Upload endpoint (Cloud Storage Prep - Mock AWS S3)
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
        }
    }
});
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
});
app.post('/api/upload', authMiddleware_1.authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            const bucketName = process.env.AWS_BUCKET_NAME || 'taskme-chama-bucket';
            const command = new client_s3_1.PutObjectCommand({
                Bucket: bucketName,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            });
            await s3Client.send(command);
            const getCommand = new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: fileName });
            const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, getCommand, { expiresIn: 3600 }); // 1 hour
            return res.json({
                message: 'File uploaded successfully to S3',
                url: signedUrl,
                fileName: req.file.originalname,
                size: req.file.size
            });
        }
        else {
            const mockFileUrl = `https://s3.amazonaws.com/taskme-chama-bucket/mock-${fileName}`;
            return res.json({
                message: 'File upload mocked (No AWS credentials)',
                url: mockFileUrl,
                fileName: req.file.originalname,
                size: req.file.size
            });
        }
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});
// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Test Database Connection
app.get('/api/db-check', async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany();
        res.json({ status: 'connected', usersCount: users.length });
    }
    catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to connect to database' });
    }
});
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seedSuperAdmins() {
    const admins = [
        { email: process.env.SUPER_ADMIN_1_EMAIL, password: process.env.SUPER_ADMIN_1_PASSWORD, name: 'Job Osindi' },
        { email: process.env.SUPER_ADMIN_2_EMAIL, password: process.env.SUPER_ADMIN_2_PASSWORD, name: 'TaskMe Admin' }
    ];
    for (const admin of admins) {
        if (admin.email && admin.password) {
            try {
                const emailLower = admin.email.toLowerCase();
                const existing = await prisma_1.prisma.user.findUnique({ where: { email: emailLower } });
                if (!existing) {
                    const hashedPassword = await bcryptjs_1.default.hash(admin.password, 10);
                    await prisma_1.prisma.user.create({
                        data: {
                            email: emailLower,
                            password: hashedPassword,
                            name: admin.name,
                            role: 'TCM_SUPER_ADMIN',
                            status: 'ACTIVE'
                        }
                    });
                    console.log(`✅ Seeded Super Admin: ${emailLower}`);
                }
                else if (existing.role !== 'TCM_SUPER_ADMIN' || existing.status !== 'ACTIVE') {
                    // Force them to be super admin and active just in case
                    await prisma_1.prisma.user.update({
                        where: { email: emailLower },
                        data: { role: 'TCM_SUPER_ADMIN', status: 'ACTIVE' }
                    });
                    console.log(`✅ Updated Super Admin role for: ${admin.email}`);
                }
            }
            catch (err) {
                console.error(`Failed to seed super admin ${admin.email}`, err);
            }
        }
    }
}
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await seedSuperAdmins();
});
//# sourceMappingURL=server.js.map