/**
 * Standardized API response helpers.
 * All responses follow the shape: { success, message, data?, meta? }
 */

export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode = 500, message = 'An error occurred', errors = null) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

export const sendCreated = (res, message = 'Resource created successfully', data = null) => {
  return sendSuccess(res, 201, message, data);
};

export const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, 404, message);
};

export const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, 401, message);
};

export const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, 403, message);
};
