import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const authService = {
  // Register new user
  async register(userData) {
    const { email, password, firstName, lastName, orgId, role = 'member' } = userData;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const result = await query(
      `INSERT INTO users (org_id, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, org_id, email, first_name, last_name, role, created_at`,
      [orgId, email, passwordHash, firstName, lastName, role]
    );

    return result.rows[0];
  },

  // Login user
  async login(email, password) {
    // Get user
    const result = await query(
      `SELECT u.*, o.name as org_name
       FROM users u
       INNER JOIN organizations o ON u.org_id = o.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        orgId: user.org_id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user info (without password) and token
    delete user.password_hash;

    return {
      user,
      token
    };
  },

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },

  // Get user by ID
  async getUserById(userId) {
    const result = await query(
      `SELECT u.id, u.org_id, u.email, u.first_name, u.last_name, u.role, u.created_at, o.name as org_name
       FROM users u
       INNER JOIN organizations o ON u.org_id = o.id
       WHERE u.id = $1`,
      [userId]
    );

    return result.rows[0];
  }
};
