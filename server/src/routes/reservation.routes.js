import express from 'express';
import {
  createReservation,
  getMyReservations,
  cancelMyReservation,
} from '../controllers/reservation.controller.js';
import {
  createReservationValidator,
  reservationIdValidator,
} from '../validators/reservation.validators.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// All reservation routes require authentication
router.use(authenticate);

router.post('/', createReservationValidator, createReservation);
router.get('/', getMyReservations);
router.delete('/:id', reservationIdValidator, cancelMyReservation);

export default router;
