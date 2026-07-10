import { ROLES } from '../models/User.js';
import { sendError } from '../utils/response.utils.js';

/**
 * Factory function that returns a middleware restricting access to specified roles.
 * Always use AFTER the `authenticate` middleware in the route chain.
 *
 * @param {...string} allowedRoles - Role strings from the ROLES constant
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        'You do not have permission to perform this action.'
      );
    }

    next();
  };
};

export const adminOnly = authorize(ROLES.ADMIN);
export const userOnly = authorize(ROLES.USER);
export const adminOrUser = authorize(ROLES.ADMIN, ROLES.USER);
export default authorize;
