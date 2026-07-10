import { verifyToken } from '../utils/jwt.utils.js';
import User from '../models/User.js';
import { sendError } from '../utils/response.utils.js';

/**
 * Verifies the JWT from the Authorization header and attaches
 * the authenticated user to req.user for downstream handlers.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authentication required. Please provide a valid token.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'User associated with this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid token. Please log in again.');
  }
};

export default authenticate;
