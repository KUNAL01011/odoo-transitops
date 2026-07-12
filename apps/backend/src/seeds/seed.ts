import { prisma } from "@/configs";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding TransitOps database...");

  /* ─────────────────────────────────────────
     1. USERS (one per role)
  ───────────────────────────────────────── */
  const hash = async (pw: string) => bcrypt.hash(pw, 12);

  const [
    admin,
    fleetManager,
    driver1,
    driver2,
    safetyOfficer,
    financialAnalyst,
  ] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@transitops.com" },
      update: {},
      create: {
        name: "Admin User",
        email: "admin@transitops.com",
        passwordHash: await hash("Admin@123"),
        role: "ADMIN",
      },
    }),
    prisma.user.upsert({
      where: { email: "fleet@transitops.com" },
      update: {},
      create: {
        name: "Rajesh Kumar",
        email: "fleet@transitops.com",
        passwordHash: await hash("Fleet@123"),
        role: "FLEET_MANAGER",
      },
    }),
    prisma.user.upsert({
      where: { email: "driver1@transitops.com" },
      update: {},
      create: {
        name: "Arjun Singh",
        email: "driver1@transitops.com",
        passwordHash: await hash("Driver@123"),
        role: "DRIVER",
      },
    }),
    prisma.user.upsert({
      where: { email: "driver2@transitops.com" },
      update: {},
      create: {
        name: "Priya Sharma",
        email: "driver2@transitops.com",
        passwordHash: await hash("Driver@123"),
        role: "DRIVER",
      },
    }),
    prisma.user.upsert({
      where: { email: "safety@transitops.com" },
      update: {},
      create: {
        name: "Neha Verma",
        email: "safety@transitops.com",
        passwordHash: await hash("Safety@123"),
        role: "SAFETY_OFFICER",
      },
    }),
    prisma.user.upsert({
      where: { email: "finance@transitops.com" },
      update: {},
      create: {
        name: "Vikram Mehta",
        email: "finance@transitops.com",
        passwordHash: await hash("Finance@123"),
        role: "FINANCIAL_ANALYST",
      },
    }),
  ]);

  console.log(
    `✅ Users seeded: ${[admin, fleetManager, driver1, driver2, safetyOfficer, financialAnalyst].map(u => u.email).join(", ")}`
  );

  /* ─────────────────────────────────────────
     2. VEHICLES
  ───────────────────────────────────────── */
  const [van05, truck01, bus02, van06, retiredTruck] = await Promise.all([
    prisma.vehicle.upsert({
      where: { registrationNumber: "VAN-05" },
      update: {},
      create: {
        registrationNumber: "VAN-05",
        name: "Tata Ace Van",
        type: "VAN",
        maxLoadCapacity: 500,
        odometer: 12400,
        acquisitionCost: 650000,
        status: "AVAILABLE",
        region: "North",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "TRK-01" },
      update: {},
      create: {
        registrationNumber: "TRK-01",
        name: "Ashok Leyland Dost",
        type: "TRUCK",
        maxLoadCapacity: 3000,
        odometer: 58200,
        acquisitionCost: 1800000,
        status: "AVAILABLE",
        region: "West",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "BUS-02" },
      update: {},
      create: {
        registrationNumber: "BUS-02",
        name: "Tata Starbus",
        type: "BUS",
        maxLoadCapacity: 8000,
        odometer: 93100,
        acquisitionCost: 3200000,
        status: "IN_SHOP",
        region: "South",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "VAN-06" },
      update: {},
      create: {
        registrationNumber: "VAN-06",
        name: "Mahindra Supro",
        type: "VAN",
        maxLoadCapacity: 750,
        odometer: 34500,
        acquisitionCost: 720000,
        status: "AVAILABLE",
        region: "East",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "TRK-00" },
      update: {},
      create: {
        registrationNumber: "TRK-00",
        name: "Old Bedford Truck",
        type: "TRUCK",
        maxLoadCapacity: 5000,
        odometer: 310000,
        acquisitionCost: 500000,
        status: "RETIRED",
        region: "North",
      },
    }),
  ]);

  console.log("✅ Vehicles seeded");

  /* ─────────────────────────────────────────
     3. DRIVERS
  ───────────────────────────────────────── */
  const [alex, meena, suspended] = await Promise.all([
    prisma.driver.upsert({
      where: { licenseNumber: "DL-2021-001234" },
      update: {},
      create: {
        name: "Alex Thomas",
        licenseNumber: "DL-2021-001234",
        licenseCategory: "HMV",
        licenseExpiry: new Date("2027-06-30"),
        contactNumber: "+91-9876543210",
        safetyScore: 95,
        status: "AVAILABLE",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-2019-005678" },
      update: {},
      create: {
        name: "Meena Pillai",
        licenseNumber: "DL-2019-005678",
        licenseCategory: "LMV",
        licenseExpiry: new Date("2026-12-15"),
        contactNumber: "+91-9765432109",
        safetyScore: 88,
        status: "AVAILABLE",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-2018-009999" },
      update: {},
      create: {
        name: "Ravi Das",
        licenseNumber: "DL-2018-009999",
        licenseCategory: "HMV",
        licenseExpiry: new Date("2025-01-01"), // expired
        contactNumber: "+91-9654321098",
        safetyScore: 55,
        status: "SUSPENDED",
      },
    }),
  ]);

  console.log("✅ Drivers seeded");

  /* ─────────────────────────────────────────
     4. COMPLETED TRIP (for analytics data)
  ───────────────────────────────────────── */
  const existingTrip = await prisma.trip.findFirst({
    where: { vehicle: { registrationNumber: "VAN-05" }, status: "COMPLETED" },
  });

  if (!existingTrip) {
    await prisma.trip.create({
      data: {
        source: "Delhi",
        destination: "Agra",
        cargoWeight: 450,
        plannedDistance: 210,
        actualDistance: 215,
        fuelConsumed: 28,
        finalOdometer: 12615,
        status: "COMPLETED",
        startedAt: new Date("2026-07-05T08:00:00Z"),
        completedAt: new Date("2026-07-05T13:00:00Z"),
        vehicleId: van05.id,
        driverId: alex.id,
        dispatchedById: fleetManager.id,
        notes: "Seed completed trip",
      },
    });
    console.log("✅ Completed trip seeded");
  }

  /* ─────────────────────────────────────────
     5. ACTIVE MAINTENANCE RECORD (for BUS-02)
  ───────────────────────────────────────── */
  const existingMaint = await prisma.maintenanceLog.findFirst({
    where: { vehicleId: bus02.id, isActive: true },
  });

  if (!existingMaint) {
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: bus02.id,
        description: "Engine overhaul and brake pad replacement",
        cost: 45000,
        isActive: true,
        startedAt: new Date("2026-07-08T09:00:00Z"),
      },
    });
    console.log("✅ Maintenance record seeded for BUS-02");
  }

  /* ─────────────────────────────────────────
     6. FUEL LOGS
  ───────────────────────────────────────── */
  const existingFuel = await prisma.fuelLog.findFirst({
    where: { vehicleId: van05.id },
  });
  if (!existingFuel) {
    await prisma.fuelLog.createMany({
      data: [
        {
          vehicleId: van05.id,
          liters: 28,
          cost: 2940,
          date: new Date("2026-07-05T07:30:00Z"),
        },
        {
          vehicleId: truck01.id,
          liters: 65,
          cost: 6825,
          date: new Date("2026-07-03T06:00:00Z"),
        },
        {
          vehicleId: van06.id,
          liters: 32,
          cost: 3360,
          date: new Date("2026-07-06T10:00:00Z"),
        },
      ],
    });
    console.log("✅ Fuel logs seeded");
  }

  /* ─────────────────────────────────────────
     7. EXPENSES
  ───────────────────────────────────────── */
  const existingExpense = await prisma.expense.findFirst({
    where: { vehicleId: van05.id },
  });
  if (!existingExpense) {
    await prisma.expense.createMany({
      data: [
        {
          vehicleId: van05.id,
          type: "TOLL",
          description: "Delhi-Agra expressway toll",
          amount: 320,
          date: new Date("2026-07-05T08:45:00Z"),
        },
        {
          vehicleId: truck01.id,
          type: "MAINTENANCE",
          description: "Oil filter change",
          amount: 1200,
          date: new Date("2026-07-01T11:00:00Z"),
        },
        {
          vehicleId: van06.id,
          type: "TOLL",
          description: "NH-48 toll booth",
          amount: 180,
          date: new Date("2026-07-06T11:00:00Z"),
        },
      ],
    });
    console.log("✅ Expenses seeded");
  }

  /* ─────────────────────────────────────────
     Summary
  ───────────────────────────────────────── */
  console.log("\n🎉 Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Login credentials:");
  console.log("  admin@transitops.com        → Admin@123   (ADMIN)");
  console.log("  fleet@transitops.com        → Fleet@123   (FLEET_MANAGER)");
  console.log("  driver1@transitops.com      → Driver@123  (DRIVER)");
  console.log("  driver2@transitops.com      → Driver@123  (DRIVER)");
  console.log("  safety@transitops.com       → Safety@123  (SAFETY_OFFICER)");
  console.log(
    "  finance@transitops.com      → Finance@123 (FINANCIAL_ANALYST)"
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
