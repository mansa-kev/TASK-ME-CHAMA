import express, { Request, Response } from 'express';
import cors from 'cors';
import { prisma } from './prisma';

import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import memberRoutes from './routes/member';
import ledgerRoutes from './routes/ledger';
import statsRoutes from './routes/stats';
import chamasRoutes from './routes/chamas';
import analyticsRoutes from './routes/analytics';
import submodulesRoutes from './routes/submodules';
import loansRoutes from './routes/loans';
import settingsDataRoutes from './routes/settings-data';
import reportsRoutes from './routes/reports';
import operationsRoutes from './routes/operations';
import paymentsRoutes from './routes/payments';
import officialsRoutes from './routes/officials';
import saasRoutes from './routes/saas';
import bylawsRoutes from './routes/bylaws';
import { idempotencyGuard } from './middlewares/idempotencyGuard';
import { generalApiLimiter } from './middlewares/securityLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-chama-id', 'idempotency-key', 'x-idempotency-key']
}));
app.use(express.json());
app.use(idempotencyGuard);

// Rate Limiting
app.use('/api/', generalApiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/saas', saasRoutes);
app.use('/api/bylaws', bylawsRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/ledgers', ledgerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/chamas', chamasRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', submodulesRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/settings-data', settingsDataRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/officials', officialsRoutes);

// File Upload endpoint (Cloud Storage Prep - Mock AWS S3)
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import { authMiddleware } from './middlewares/authMiddleware';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  }
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});

app.post('/api/upload', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
    
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const bucketName = process.env.AWS_BUCKET_NAME || 'taskme-chama-bucket';
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });
      await s3Client.send(command);
      
      const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: fileName });
      const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 }); // 1 hour

      return res.json({
        message: 'File uploaded successfully to S3',
        url: signedUrl,
        fileName: req.file.originalname,
        size: req.file.size
      });
    } else {
      const mockFileUrl = `https://s3.amazonaws.com/taskme-chama-bucket/mock-${fileName}`;
      return res.json({
        message: 'File upload mocked (No AWS credentials)',
        url: mockFileUrl,
        fileName: req.file.originalname,
        size: req.file.size
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Basic health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Test Database Connection
app.get('/api/db-check', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ status: 'connected', usersCount: users.length });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to connect to database' });
  }
});

import bcrypt from 'bcryptjs';

async function seedSuperAdmins() {
  const admins = [
    { email: process.env.SUPER_ADMIN_1_EMAIL, password: process.env.SUPER_ADMIN_1_PASSWORD, name: 'Job Osindi' },
    { email: process.env.SUPER_ADMIN_2_EMAIL, password: process.env.SUPER_ADMIN_2_PASSWORD, name: 'TaskMe Admin' }
  ];

  for (const admin of admins) {
    if (admin.email && admin.password) {
      try {
        const existing = await prisma.user.findUnique({ where: { email: admin.email } });
        if (!existing) {
          const hashedPassword = await bcrypt.hash(admin.password, 10);
          await prisma.user.create({
            data: {
              email: admin.email,
              password: hashedPassword,
              name: admin.name,
              role: 'TCM_SUPER_ADMIN',
              status: 'ACTIVE'
            }
          });
          console.log(`✅ Seeded Super Admin: ${admin.email}`);
        } else if (existing.role !== 'TCM_SUPER_ADMIN' || existing.status !== 'ACTIVE') {
          // Force them to be super admin and active just in case
          await prisma.user.update({
            where: { email: admin.email },
            data: { role: 'TCM_SUPER_ADMIN', status: 'ACTIVE' }
          });
          console.log(`✅ Updated Super Admin role for: ${admin.email}`);
        }
      } catch (err) {
        console.error(`Failed to seed super admin ${admin.email}`, err);
      }
    }
  }
}

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await seedSuperAdmins();
});
