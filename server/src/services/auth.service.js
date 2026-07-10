import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.utils.js';

const SALT_ROUNDS = 12;

/**
 * Registers a new user. Returns the created user and a signed JWT.
 */
const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = signToken({ id: user._id, role: user.role });

  return { user, token };
};

/**
 * Authenticates a user by email and password. Returns user and JWT on success.
 */
const login = async ({ email, password }) => {
  // Explicitly select password since it's excluded by default in the schema
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({ id: user._id, role: user.role });

  // Remove password before returning
  user.password = undefined;

  return { user, token };
};

export default { register, login };
