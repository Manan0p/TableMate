# TableMate — Restaurant Reservation Management System

A production-ready full-stack application for managing restaurant reservations. Built with React 19, Node.js, Express, and MongoDB.

## 🌟 Project Overview
TableMate streamlines the dining experience for both customers and restaurant staff. 
- **Customers** can book tables, manage their reservations, and view their dining history through a beautiful, responsive dark-mode interface.
- **Administrators** gain a powerful dashboard to monitor daily operations, view reservation trends, manage table inventory, and manually adjust bookings.

**Core Feature: Intelligent Auto-Assignment**
Customers do *not* pick their tables. Instead, the backend employs a robust overlap-detection algorithm to automatically assign the smallest available table that perfectly accommodates the party size without conflicting with existing reservations.

## 🏗️ Architecture & Technologies

**Frontend (client/)**
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Routing:** React Router v6
- **Styling:** Tailwind CSS (Custom Dark Mode & Glassmorphism UI)
- **State Management:** React Query (TanStack Query v5)
- **Forms & Validation:** React Hook Form + Zod
- **API Client:** Axios (with Interceptors)
- **UI Components:** Framer Motion (Animations), Lucide React (Icons), Recharts (Analytics), Sonner (Toasts)

**Backend (server/)**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **Validation:** express-validator
- **Security:** Helmet, CORS
- **Architecture:** Clean Architecture (Routes → Controllers → Services)

## 📂 Folder Structure

```
restaurant-reservation-system/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Layout, Modal, ProtectedRoute)
│   │   ├── contexts/           # React Context (AuthContext)
│   │   ├── lib/                # Utilities (Axios instance)
│   │   ├── pages/              # Route components (Admin, Customer, Auth)
│   │   ├── App.tsx             # Route configuration
│   │   ├── main.tsx            # Entry point & Providers
│   │   └── index.css           # Tailwind & Global Styles
│   └── package.json
│
├── server/                     # Backend API
│   ├── src/
│   │   ├── config/             # DB connection
│   │   ├── controllers/        # Request/Response handling
│   │   ├── middleware/         # Auth, Roles, Error handlers
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API routing
│   │   ├── services/           # Business logic & Algorithms
│   │   ├── utils/              # Helpers (JWT, standard responses)
│   │   ├── validators/         # Input validation schemas
│   │   ├── seed/               # Database seeder
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Entry point
│   └── package.json
└── README.md
```

## 🚀 Installation & Run Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URL (or local MongoDB)

### 2. Backend Setup
```bash
cd server
npm install

# Configure Environment Variables
cp .env.example .env
# Edit .env and add your MONGODB_URI and a strong JWT_SECRET
```

**Seed the Database (Required for tables & admin account)**
```bash
npm run seed
```
*Note: This will wipe existing data and create an admin user (`admin@example.com` / `password123`) and 10 tables of varying capacities.*

**Start Backend**
```bash
npm run dev
```

### 3. Frontend Setup
```bash
# In a new terminal
cd client
npm install

# Configure Environment Variables
cp .env.example .env

# Start Frontend
npm run dev
```
The app will be running at `http://localhost:5173`.

## 🔐 Role Based Access & API Documentation

The system utilizes JWT stored in localStorage and attached via Axios interceptors. 

### Roles
- **USER:** Can book tables, view own history, and cancel own pending/confirmed bookings.
- **ADMIN:** Can view all reservations, view dashboard stats, change reservation status, modify booking times, and manage (CRUD) the physical table inventory.

### API Endpoints
**Auth**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate
- `GET /api/auth/me` - Get profile (Protected)

**Customer (Protected)**
- `POST /api/reservations` - Create booking (triggers auto-assign)
- `GET /api/reservations` - List own bookings
- `DELETE /api/reservations/:id` - Cancel own booking

**Admin (Protected: Admin Only)**
- `GET /api/admin/dashboard` - Get analytics
- `GET /api/admin/reservations` - List all (with search/filter)
- `PUT /api/admin/reservations/:id` - Update status/details
- `DELETE /api/admin/reservations/:id` - Cancel any booking
- `POST /api/tables` - Add table
- `PUT /api/tables/:id` - Edit table
- `DELETE /api/tables/:id` - Delete table

**Public**
- `GET /api/tables` - List available tables (auth required, but accessible to users)

## 🧠 Reservation Algorithm

The core business logic resides in `src/services/reservation.service.js`.

When a `POST /api/reservations` request is received:
1. **Filter by Capacity:** Retrieve all active tables where `capacity >= guestCount`.
2. **Sort:** Order these tables ascending by capacity (to preserve larger tables for larger groups).
3. **Check Overlap:** Iterate through the tables. For each table, query existing confirmed/pending reservations for that specific date.
4. **Time Math:** Convert "HH:MM" strings to absolute minutes since midnight. Apply the overlap formula: `(existingStart < newEnd) && (existingEnd > newStart)`.
5. **Assign or Reject:** The first table with zero overlaps is assigned. If all suitable tables have overlaps, a `409 Conflict` is returned gracefully.

## 🚢 Deployment

### Backend (Render)
1. Push to GitHub.
2. Connect repository to Render as a "Web Service".
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`).

### Frontend (Vercel)
1. Push to GitHub.
2. Connect repository to Vercel.
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`

## 🔮 Future Improvements
- **Email Notifications:** Integrate SendGrid/Resend to email customers upon confirmation/cancellation.
- **Real-time Updates:** Add Socket.io so the Admin dashboard updates live when a customer books a table.
- **Stripe Integration:** Require a deposit for reservations of 8+ people.
