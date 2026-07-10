import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Signs a JWT payload. Throws if JWT_SECRET is not configured.
 * @param {object} payload - Data to encode in the token
 * @returns {string} Signed JWT string
 */
const signToken = (payload) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies and decodes a JWT string.
 * @param {string} token - JWT string to verify
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }
  return jwt.verify(token, JWT_SECRET);
};

export { signToken, verifyToken };
