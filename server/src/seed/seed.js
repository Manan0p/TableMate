import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User, { ROLES } from '../models/User.js';
import Table from '../models/Table.js';
import Reservation from '../models/Reservation.js';

const SALT_ROUNDS = 12;

const tables = [
  { tableNumber: 1,  capacity: 2  },
  { tableNumber: 2,  capacity: 2  },
  { tableNumber: 3,  capacity: 4  },
  { tableNumber: 4,  capacity: 4  },
  { tableNumber: 5,  capacity: 4  },
  { tableNumber: 6,  capacity: 6  },
  { tableNumber: 7,  capacity: 6  },
  { tableNumber: 8,  capacity: 8  },
  { tableNumber: 9,  capacity: 8  },
  { tableNumber: 10, capacity: 10 },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Table.deleteMany({}),
      Reservation.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data.');

    // Create admin user
    const adminPassword = await bcrypt.hash('password123', SALT_ROUNDS);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: ROLES.ADMIN,
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create sample customer user
    const customerPassword = await bcrypt.hash('password123', SALT_ROUNDS);
    const customer = await User.create({
      name: 'John Doe',
      email: 'customer@example.com',
      password: customerPassword,
      role: ROLES.USER,
    });
    console.log(`✅ Customer created: ${customer.email}`);

    // Create tables
    const createdTables = await Table.insertMany(tables);
    console.log(`✅ Created ${createdTables.length} tables.`);

    // Seed some sample reservations for demo purposes
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const dayAfter = new Date(today);
    dayAfter.setUTCDate(dayAfter.getUTCDate() + 2);

    const sampleReservations = [
      {
        customer: customer._id,
        table: createdTables[2]._id, // 4-seat table
        reservationDate: tomorrow,
        startTime: '18:00',
        endTime: '20:00',
        guestCount: 3,
        status: 'confirmed',
        specialRequests: 'Window seat preferred',
      },
      {
        customer: customer._id,
        table: createdTables[5]._id, // 6-seat table
        reservationDate: dayAfter,
        startTime: '19:30',
        endTime: '21:30',
        guestCount: 5,
        status: 'confirmed',
      },
    ];

    await Reservation.insertMany(sampleReservations);
    console.log(`✅ Created ${sampleReservations.length} sample reservations.`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────────');
    console.log('Admin credentials:');
    console.log('  Email:    admin@example.com');
    console.log('  Password: password123');
    console.log('─────────────────────────────────────');
    console.log('Customer credentials:');
    console.log('  Email:    customer@example.com');
    console.log('  Password: password123');
    console.log('─────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
