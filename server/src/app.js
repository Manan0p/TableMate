import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import tableRoutes from './routes/table.routes.js';
import adminRoutes from './routes/admin.routes.js';
import errorHandler from './middleware/errorHandler.js';
import { sendError } from './utils/response.utils.js';

const app = express();

// ---------------------------------------------------------------------------
// Security & Parsing Middleware
// ---------------------------------------------------------------------------
app.use(helmet());
const clientUrl = process.env.CLIENT_URL;
const allowedOrigin = clientUrl ? clientUrl.replace(/\/$/, '') : 'http://localhost:5173';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ---------------------------------------------------------------------------
// Welcome & Health Check Routes
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the TableMate API. Refer to the documentation to access endpoints.',
    health: `${req.protocol}://${req.get('host')}/health`
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/admin', adminRoutes);

// ---------------------------------------------------------------------------
// 404 Handler — catches any unmatched route
// ---------------------------------------------------------------------------
app.use((req, res) => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found.`);
});

// ---------------------------------------------------------------------------
// Global Error Handler — must be last
// ---------------------------------------------------------------------------
app.use(errorHandler);

export default app;
