import { body, param } from 'express-validator';

export const createReservationValidator = [
  body('reservationDate')
    .notEmpty().withMessage('Reservation date is required.')
    .isISO8601().withMessage('Reservation date must be a valid ISO 8601 date.')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Cannot make reservations for past dates.');
      }
      return true;
    }),

  body('startTime')
    .notEmpty().withMessage('Start time is required.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:MM format (24-hour).'),

  body('endTime')
    .notEmpty().withMessage('End time is required.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:MM format (24-hour).')
    .custom((endTime, { req }) => {
      if (req.body.startTime && endTime <= req.body.startTime) {
        throw new Error('End time must be after start time.');
      }
      return true;
    }),

  body('guestCount')
    .notEmpty().withMessage('Guest count is required.')
    .isInt({ min: 1 }).withMessage('Guest count must be at least 1.')
    .isInt({ max: 50 }).withMessage('Guest count cannot exceed 50.'),

  body('specialRequests')
    .optional()
    .isLength({ max: 500 }).withMessage('Special requests cannot exceed 500 characters.')
    .trim(),
];

export const updateReservationValidator = [
  param('id')
    .isMongoId().withMessage('Invalid reservation ID.'),

  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Status must be one of: pending, confirmed, cancelled, completed.'),

  body('reservationDate')
    .optional()
    .isISO8601().withMessage('Reservation date must be a valid ISO 8601 date.'),

  body('startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:MM format.'),

  body('endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:MM format.'),

  body('guestCount')
    .optional()
    .isInt({ min: 1 }).withMessage('Guest count must be at least 1.'),
];

export const reservationIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid reservation ID.'),
];
