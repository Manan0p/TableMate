import { validationResult } from 'express-validator';
import reservationService from '../services/reservation.service.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

/**
 * GET /admin/reservations
 * Returns all reservations with search, filter, sort, and pagination.
 */
export const getAllReservations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, date, search, sortBy, sortOrder } = req.query;

    const result = await reservationService.getAllReservations({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      date,
      search,
      sortBy,
      sortOrder,
    });

    return sendSuccess(res, 200, 'Reservations retrieved successfully.', result.reservations, result.pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /admin/reservations/:id
 * Admin can update any reservation's status, time, or guest count.
 */
export const updateReservation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed.', errors.array());
    }

    const { id } = req.params;
    const reservation = await reservationService.adminUpdateReservation(id, req.body);

    return sendSuccess(res, 200, 'Reservation updated successfully.', { reservation });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /admin/reservations/:id
 * Admin can cancel any reservation.
 */
export const adminCancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await reservationService.cancelReservation(id, req.user._id, true);

    return sendSuccess(res, 200, 'Reservation cancelled successfully.', { reservation });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/dashboard
 * Aggregated statistics for the admin dashboard.
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await reservationService.getDashboardStats();
    return sendSuccess(res, 200, 'Dashboard statistics retrieved.', { stats });
  } catch (error) {
    next(error);
  }
};
