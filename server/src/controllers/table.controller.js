import { validationResult } from 'express-validator';
import tableService from '../services/table.service.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.utils.js';

/**
 * GET /tables
 * Returns all active tables. Admins can request inactive tables too.
 */
export const getTables = async (req, res, next) => {
  try {
    const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true';
    const tables = await tableService.getAllTables({ includeInactive });

    return sendSuccess(res, 200, 'Tables retrieved successfully.', { tables });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /tables
 * Admin only — create a new table.
 */
export const createTable = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed.', errors.array());
    }

    const { tableNumber, capacity, isActive } = req.body;
    const table = await tableService.createTable({ tableNumber, capacity, isActive });

    return sendCreated(res, 'Table created successfully.', { table });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /tables/:id
 * Admin only — update an existing table.
 */
export const updateTable = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed.', errors.array());
    }

    const { id } = req.params;
    const table = await tableService.updateTable(id, req.body);

    return sendSuccess(res, 200, 'Table updated successfully.', { table });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /tables/:id
 * Admin only — permanently delete a table.
 */
export const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    await tableService.deleteTable(id);

    return sendSuccess(res, 200, 'Table deleted successfully.');
  } catch (error) {
    next(error);
  }
};
