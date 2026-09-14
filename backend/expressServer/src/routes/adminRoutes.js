import express from 'express';
import { adminLogin, getAdminProfile, updateVerificationStatus } from '../controllers/adminController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public Authentication Route
router.post('/login', adminLogin);

// Protected Official Admin Routes
router.get('/me', authenticateAdmin, getAdminProfile);
router.patch('/verify/:id', authenticateAdmin, updateVerificationStatus);

export default router;
