import { Router } from 'express';
import { register, login, changePassword } from '../controllers/auth';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', authMiddleware, changePassword);

export default router;
