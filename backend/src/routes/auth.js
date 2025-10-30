import express from 'express';
import { authService } from '../services/authService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, orgId } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Use default org if not specified
    const targetOrgId = orgId || parseInt(process.env.DEFAULT_ORG_ID) || 1;

    // Register user
    const user = await authService.register({
      email,
      password,
      firstName,
      lastName,
      orgId: targetOrgId
    });

    res.status(201).json({
      message: 'User created successfully',
      user
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Login
    const { user, token } = await authService.login(email, password);

    res.json({
      message: 'Login successful',
      user,
      token
    });

  } catch (error) {
    console.error('Login error:', error);

    if (error.message.includes('Invalid')) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;
