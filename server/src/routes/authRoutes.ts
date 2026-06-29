import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Register endpoint
router.post('/register', register);

// Login endpoint
router.post('/login', login);

// Get profile endpoint (protected)
router.get('/profile', authenticateToken, getProfile);

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;
