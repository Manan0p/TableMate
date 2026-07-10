import express from 'express';
import {
  getAllReservations,
  updateReservation,
  adminCancelReservation,
  getDashboardStats,
} from '../controllers/admin.controller.js';
import {
  updateReservationValidator,
  reservationIdValidator,
} from '../validators/reservation.validators.js';
import authenticate from '../middleware/auth.js';
import { adminOnly } from '../middleware/roles.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/reservations', getAllReservations);
router.put('/reservations/:id', updateReservationValidator, updateReservation);
router.delete('/reservations/:id', reservationIdValidator, adminCancelReservation);

export default router;
