import { PrismaClient, VehicleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        passwordHash,
        avatarColor: '#06b6d4', // cyan
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        passwordHash,
        avatarColor: '#8b5cf6', // violet
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carol Davis',
        email: 'carol@example.com',
        passwordHash,
        avatarColor: '#f59e0b', // amber
      },
    }),
    prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@example.com',
        passwordHash: await bcrypt.hash('demo1234', 10),
        avatarColor: '#10b981', // emerald
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        name: 'Blue Toyota Corolla',
        type: VehicleType.CAR,
        licensePlate: 'ABC-1234',
        color: '#3b82f6', // blue
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'Red Honda CR-V',
        type: VehicleType.SUV,
        licensePlate: 'XYZ-5678',
        color: '#ef4444', // red
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'White Ford Transit',
        type: VehicleType.VAN,
        licensePlate: 'VAN-9012',
        color: '#6b7280', // gray
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'Green Tesla Model Y',
        type: VehicleType.SUV,
        licensePlate: 'EV-3456',
        color: '#22c55e', // green
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'Orange Ford F-150',
        type: VehicleType.TRUCK,
        licensePlate: 'TRK-7890',
        color: '#f97316', // orange
      },
    }),
  ]);

  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Create sample bookings for the current week
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Helper to create date at specific hour
  const atHour = (daysFromToday: number, hour: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysFromToday);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  const bookings = await Promise.all([
    // Today's bookings
    prisma.booking.create({
      data: {
        userId: users[0].id,
        vehicleId: vehicles[0].id,
        title: 'Morning commute',
        description: 'Going to the office',
        startTime: atHour(0, 8),
        endTime: atHour(0, 10),
      },
    }),
    prisma.booking.create({
      data: {
        userId: users[1].id,
        vehicleId: vehicles[1].id,
        title: 'Client meeting',
        description: 'Meeting at downtown office',
        startTime: atHour(0, 9),
        endTime: atHour(0, 12),
      },
    }),
    prisma.booking.create({
      data: {
        userId: users[2].id,
        vehicleId: vehicles[2].id,
        title: 'Delivery run',
        description: 'Delivering equipment to warehouse',
        startTime: atHour(0, 14),
        endTime: atHour(0, 17),
      },
    }),

    // Tomorrow's bookings
    prisma.booking.create({
      data: {
        userId: users[0].id,
        vehicleId: vehicles[3].id,
        title: 'Team outing',
        description: 'Trip to the park',
        startTime: atHour(1, 10),
        endTime: atHour(1, 15),
      },
    }),
    prisma.booking.create({
      data: {
        userId: users[1].id,
        vehicleId: vehicles[0].id,
        title: 'Airport pickup',
        startTime: atHour(1, 16),
        endTime: atHour(1, 19),
      },
    }),

    // Day after tomorrow
    prisma.booking.create({
      data: {
        userId: users[2].id,
        vehicleId: vehicles[4].id,
        title: 'Moving supplies',
        description: 'Picking up office furniture',
        startTime: atHour(2, 8),
        endTime: atHour(2, 14),
      },
    }),
    prisma.booking.create({
      data: {
        userId: users[0].id,
        vehicleId: vehicles[1].id,
        title: 'Site visit',
        startTime: atHour(2, 13),
        endTime: atHour(2, 16),
      },
    }),

    // Later this week
    prisma.booking.create({
      data: {
        userId: users[1].id,
        vehicleId: vehicles[2].id,
        title: 'Grocery run',
        description: 'Weekly shopping for office',
        startTime: atHour(3, 11),
        endTime: atHour(3, 13),
      },
    }),
    prisma.booking.create({
      data: {
        userId: users[2].id,
        vehicleId: vehicles[0].id,
        title: 'Conference attendance',
        startTime: atHour(4, 7),
        endTime: atHour(4, 18),
      },
    }),
    prisma.booking.create({
      data: {
        userId: users[0].id,
        vehicleId: vehicles[3].id,
        title: 'Weekend trip prep',
        startTime: atHour(5, 15),
        endTime: atHour(5, 19),
      },
    }),
  ]);

  console.log(`✅ Created ${bookings.length} bookings`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('   Email: demo@example.com');
  console.log('   Password: demo1234');
  console.log('\n   Or use any of these users with password "password123":');
  console.log('   - alice@example.com');
  console.log('   - bob@example.com');
  console.log('   - carol@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
