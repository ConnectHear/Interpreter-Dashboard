const express = require('express');
const crypto = require('crypto'); // built-in, no install needed
const router = express.Router();

// Hardcoded credentials
const ADMIN_EMAIL = 'admin@connecthear.org';
const ADMIN_PASSWORD = 'admin@123';

// Secret used to sign & verify tokens — set JWT_SECRET in your .env / Vercel env vars
const SECRET = process.env.JWT_SECRET || 'local_dev_secret_change_in_prod';

/**
 * Create a stateless signed token:
 *   payload  = base64(JSON)
 *   sig      = HMAC-SHA256(payload, SECRET)
 *   token    = payload.sig
 *
 * Because the signature is computed from the SECRET (never sent to the client),
 * any Vercel serverless instance can validate it without shared in-memory state.
 */
function createToken(data) {
    const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
    const sig = crypto
        .createHmac('sha256', SECRET)
        .update(payload)
        .digest('base64url');
    return `${payload}.${sig}`;
}

function verifyToken(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, sig] = parts;
    const expected = crypto
        .createHmac('sha256', SECRET)
        .update(payload)
        .digest('base64url');
    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    try {
        return JSON.parse(Buffer.from(payload, 'base64url').toString());
    } catch {
        return null;
    }
}

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createToken({ email: ADMIN_EMAIL, name: 'Admin', iat: Date.now() });
    res.json({ token, user: { email: ADMIN_EMAIL, name: 'Admin' } });
});

// POST /api/auth/logout  (stateless — client just discards the token)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out' });
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
    const raw = req.headers.authorization?.replace('Bearer ', '');
    const data = verifyToken(raw);
    if (!data) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    res.json({ valid: true, user: { email: data.email, name: data.name } });
});

module.exports = { authRoutes: router };
