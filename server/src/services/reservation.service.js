import Table from '../models/Table.js';
import Reservation, { RESERVATION_STATUS } from '../models/Reservation.js';

// ---------------------------------------------------------------------------
// Core auto-assignment algorithm
// ---------------------------------------------------------------------------

/**
 * Converts a "HH:MM" time string to total minutes since midnight.
 * Used for time-overlap arithmetic without Date objects.
 * @param {string} time - "HH:MM"
 * @returns {number} minutes since midnight
 */
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Checks whether two time intervals overlap.
 * Overlap condition: existingStart < newEnd AND existingEnd > newStart
 *
 * @param {string} existingStart - "HH:MM"
 * @param {string} existingEnd   - "HH:MM"
 * @param {string} newStart      - "HH:MM"
 * @param {string} newEnd        - "HH:MM"
 * @returns {boolean}
 */
const hasTimeOverlap = (existingStart, existingEnd, newStart, newEnd) => {
  const exStart = timeToMinutes(existingStart);
  const exEnd   = timeToMinutes(existingEnd);
  const nStart  = timeToMinutes(newStart);
  const nEnd    = timeToMinutes(newEnd);

  return exStart < nEnd && exEnd > nStart;
};

/**
 * Auto-assigns the smallest available table for the given slot.
 *
 * Algorithm:
 *  1. Fetch all active tables with capacity >= guestCount, sorted ascending by capacity.
 *  2. For each table (smallest first), load existing CONFIRMED/PENDING reservations
 *     on the same date.
 *  3. Check for time overlap. If none — assign that table.
 *  4. If all tables conflict — throw 409 Conflict.
 *
 * @param {number} guestCount
 * @param {Date}   reservationDate
 * @param {string} startTime - "HH:MM"
 * @param {string} endTime   - "HH:MM"
 * @param {string|null} excludeReservationId - exclude self when updating
 * @returns {mongoose.Document} Assigned table document
 */
const findAvailableTable = async (guestCount, reservationDate, startTime, endTime, excludeReservationId = null) => {
  // Normalize to start-of-day for date comparison
  const dateOnly = new Date(reservationDate);
  dateOnly.setUTCHours(0, 0, 0, 0);
  const nextDay = new Date(dateOnly);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  // Step 1 & 2: Get eligible tables sorted by capacity ASC
  const tables = await Table.find({
    isActive: true,
    capacity: { $gte: guestCount },
  }).sort({ capacity: 1, tableNumber: 1 });

  if (tables.length === 0) {
    const error = new Error('No tables with sufficient capacity are available.');
    error.statusCode = 409;
    throw error;
  }

  // Step 3: Try each table in order
  for (const table of tables) {
    const conflictQuery = {
      table: table._id,
      reservationDate: { $gte: dateOnly, $lt: nextDay },
      status: { $in: [RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.PENDING] },
    };

    if (excludeReservationId) {
      conflictQuery._id = { $ne: excludeReservationId };
    }

    const existingReservations = await Reservation.find(conflictQuery).select(
      'startTime endTime'
    );

    const hasConflict = existingReservations.some((res) =>
      hasTimeOverlap(res.startTime, res.endTime, startTime, endTime)
    );

    if (!hasConflict) {
      return table; // Found an available table — assign it
    }
  }

  // Step 4: All suitable tables are occupied
  const error = new Error('No tables available for the selected time slot. Please choose a different time.');
  error.statusCode = 409;
  throw error;
};

// ---------------------------------------------------------------------------
// Service methods
// ---------------------------------------------------------------------------

/**
 * Creates a new reservation with automatic table assignment.
 */
const createReservation = async ({ customerId, reservationDate, startTime, endTime, guestCount, specialRequests }) => {
  const table = await findAvailableTable(guestCount, reservationDate, startTime, endTime);

  const reservation = await Reservation.create({
    customer: customerId,
    table: table._id,
    reservationDate: new Date(reservationDate),
    startTime,
    endTime,
    guestCount,
    specialRequests,
    status: RESERVATION_STATUS.CONFIRMED,
  });

  return reservation.populate([
    { path: 'table', select: 'tableNumber capacity' },
    { path: 'customer', select: 'name email' },
  ]);
};

/**
 * Retrieves all reservations for a specific customer with pagination.
 */
const getCustomerReservations = async (customerId, { page = 1, limit = 10, status } = {}) => {
  const filter = { customer: customerId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const total = await Reservation.countDocuments(filter);

  const reservations = await Reservation.find(filter)
    .populate('table', 'tableNumber capacity')
    .sort({ reservationDate: -1, startTime: -1 })
    .skip(skip)
    .limit(limit);

  return {
    reservations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Retrieves all reservations (admin view) with search, filter, pagination, and sorting.
 */
const getAllReservations = async ({ page = 1, limit = 10, status, date, search, sortBy = 'reservationDate', sortOrder = 'desc' } = {}) => {
  const filter = {};
  if (status) filter.status = status;

  if (date) {
    const dateOnly = new Date(date);
    dateOnly.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(dateOnly);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    filter.reservationDate = { $gte: dateOnly, $lt: nextDay };
  }

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOptions = { [sortBy]: sortDirection };
  const skip = (page - 1) * limit;

  let query = Reservation.find(filter)
    .populate('table', 'tableNumber capacity')
    .populate('customer', 'name email')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  // Search by customer name or email (via aggregation would be cleaner,
  // but populate + in-memory filter is acceptable for moderate data sets)
  let reservations = await query;

  if (search) {
    const term = search.toLowerCase();
    reservations = reservations.filter(
      (r) =>
        r.customer?.name?.toLowerCase().includes(term) ||
        r.customer?.email?.toLowerCase().includes(term)
    );
  }

  const total = await Reservation.countDocuments(filter);

  return {
    reservations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Cancels a reservation. Customers can only cancel their own; admins can cancel any.
 */
const cancelReservation = async (reservationId, userId, isAdmin = false) => {
  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    const error = new Error('Reservation not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!isAdmin && reservation.customer.toString() !== userId.toString()) {
    const error = new Error('You are not authorized to cancel this reservation.');
    error.statusCode = 403;
    throw error;
  }

  if (reservation.status === RESERVATION_STATUS.CANCELLED) {
    const error = new Error('This reservation has already been cancelled.');
    error.statusCode = 400;
    throw error;
  }

  reservation.status = RESERVATION_STATUS.CANCELLED;
  await reservation.save();

  return reservation.populate([
    { path: 'table', select: 'tableNumber capacity' },
    { path: 'customer', select: 'name email' },
  ]);
};

/**
 * Admin update — allows changing status, time, date, guestCount.
 * Re-runs auto-assignment if time/date/guestCount change.
 */
const adminUpdateReservation = async (reservationId, updates) => {
  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    const error = new Error('Reservation not found.');
    error.statusCode = 404;
    throw error;
  }

  const {
    status,
    reservationDate = reservation.reservationDate,
    startTime = reservation.startTime,
    endTime = reservation.endTime,
    guestCount = reservation.guestCount,
    specialRequests,
  } = updates;

  // Re-run assignment only when scheduling details change
  const scheduleChanged =
    updates.reservationDate || updates.startTime || updates.endTime || updates.guestCount;

  if (scheduleChanged && status !== RESERVATION_STATUS.CANCELLED) {
    const table = await findAvailableTable(
      guestCount,
      reservationDate,
      startTime,
      endTime,
      reservationId
    );
    reservation.table = table._id;
  }

  if (status) reservation.status = status;
  reservation.reservationDate = new Date(reservationDate);
  reservation.startTime = startTime;
  reservation.endTime = endTime;
  reservation.guestCount = guestCount;
  if (specialRequests !== undefined) reservation.specialRequests = specialRequests;

  await reservation.save();

  return reservation.populate([
    { path: 'table', select: 'tableNumber capacity' },
    { path: 'customer', select: 'name email' },
  ]);
};

/**
 * Returns statistics for the admin dashboard.
 */
const getDashboardStats = async () => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  const [total, todayCount, cancelled, upcoming, recentReservations, tableStats] =
    await Promise.all([
      Reservation.countDocuments(),
      Reservation.countDocuments({
        reservationDate: { $gte: todayStart, $lt: todayEnd },
      }),
      Reservation.countDocuments({ status: RESERVATION_STATUS.CANCELLED }),
      Reservation.countDocuments({
        reservationDate: { $gte: now },
        status: { $in: [RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.PENDING] },
      }),
      // Last 7 days for chart
      Reservation.aggregate([
        {
          $match: {
            reservationDate: {
              $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$reservationDate' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Table.countDocuments({ isActive: true }),
    ]);

  return {
    total,
    today: todayCount,
    cancelled,
    upcoming,
    activeTables: tableStats,
    chartData: recentReservations,
  };
};

export default {
  createReservation,
  getCustomerReservations,
  getAllReservations,
  cancelReservation,
  adminUpdateReservation,
  getDashboardStats,
};
