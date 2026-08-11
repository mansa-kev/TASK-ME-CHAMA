"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = require("./prisma");
const arrearsEngine_1 = require("./cron/arrearsEngine");
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const member_1 = __importDefault(require("./routes/member"));
const ledger_1 = __importDefault(require("./routes/ledger"));
const stats_1 = __importDefault(require("./routes/stats"));
const chamas_1 = __importDefault(require("./routes/chamas"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const submodules_1 = __importDefault(require("./routes/submodules"));
const loans_1 = __importDefault(require("./routes/loans"));
const settings_data_1 = __importDefault(require("./routes/settings-data"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Rate Limiting
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs (Dashboard fires 18 concurrent requests)
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);
app.use('/api/auth', auth_1.default);
app.use('/api/members', member_1.default);
app.use('/api/ledgers', ledger_1.default);
app.use('/api/stats', stats_1.default);
app.use('/api/chamas', chamas_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api', submodules_1.default);
app.use('/api/loans', loans_1.default);
app.use('/api/settings-data', settings_data_1.default);
// File Upload endpoint (Cloud Storage Prep - Mock AWS S3)
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage(); // Prepare for S3 buffers
const upload = (0, multer_1.default)({ storage });
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
});
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
        // Check if AWS credentials are set, otherwise use mock
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            const bucketName = process.env.AWS_S3_BUCKET_NAME || 'taskme-chama-bucket';
            const command = new client_s3_1.PutObjectCommand({
                Bucket: bucketName,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            });
            await s3Client.send(command);
            const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
            return res.json({
                message: 'File uploaded successfully to S3',
                url: fileUrl,
                fileName: req.file.originalname,
                size: req.file.size
            });
        }
        else {
            // Fallback for development without AWS credentials
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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    (0, arrearsEngine_1.startArrearsEngine)();
});
//# sourceMappingURL=server.js.map