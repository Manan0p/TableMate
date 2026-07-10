import { validationResult } from 'express-validator';
import reservationService from '../services/reservation.service.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.utils.js';

/**
 * POST /reservations
 * Create a new reservation with automatic table assignment.
 */
export const createReservation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed.', errors.array());
    }

    const { reservationDate, startTime, endTime, guestCount, specialRequests } = req.body;

    const reservation = await reservationService.createReservation({
      customerId: req.user._id,
      reservationDate,
      startTime,
      endTime,
      guestCount,
      specialRequests,
    });

    return sendCreated(res, 'Reservation created successfully.', { reservation });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /reservations
 * Returns paginated reservations for the authenticated customer.
 */
export const getMyReservations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const result = await reservationService.getCustomerReservations(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });

    return sendSuccess(res, 200, 'Reservations retrieved successfully.', result.reservations, result.pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /reservations/:id
 * Allows a customer to cancel their own reservation.
 */
export const cancelMyReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await reservationService.cancelReservation(id, req.user._id, false);

    return sendSuccess(res, 200, 'Reservation cancelled successfully.', { reservation });
  } catch (error) {
    next(error);
  }
};
