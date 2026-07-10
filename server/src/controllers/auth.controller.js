import { validationResult } from 'express-validator';
import authService from '../services/auth.service.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.utils.js';

/**
 * POST /auth/register
 */
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed.', errors.array());
    }

    const { name, email, password } = req.body;
    const { user, token } = await authService.register({ name, email, password });

    return sendCreated(res, 'Account created successfully.', { user, token });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/login
 */
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed.', errors.array());
    }

    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });

    return sendSuccess(res, 200, 'Login successful.', { user, token });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /me
 * Returns the currently authenticated user's profile.
 */
export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Profile retrieved successfully.', { user: req.user });
  } catch (error) {
    next(error);
  }
};
