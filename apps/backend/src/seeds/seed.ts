import { prisma } from "@/configs";
import bcrypt from "bcryptjs"; // Adjust this import if your client is exported differently

async function main() {
  console.log("Seeding TransitOps database with mock data...");

  /* ─────────────────────────────────────────
     1. USERS
  ───────────────────────────────────────── */
  const hash = async (pw: string) => bcrypt.hash(pw, 12);

  const [dispatcher, fleetManager, safetyOfficer, financialAnalyst] =
    await Promise.all([
      prisma.user.upsert({
        where: { email: "raven.k@transitops.in" },
        update: {},
        create: {
          name: "Raven K.",
          email: "raven.k@transitops.in",
          passwordHash: await hash("Pass@123"),
          role: "DISPATCHER",
        },
      }),
      prisma.user.upsert({
        where: { email: "kavya.nair@transitops.in" },
        update: {},
        create: {
          name: "Kavya Nair",
          email: "kavya.nair@transitops.in",
          passwordHash: await hash("Pass@123"),
          role: "FLEET_MANAGER",
        },
      }),
      prisma.user.upsert({
        where: { email: "meera.iyer@transitops.in" },
        update: {},
        create: {
          name: "Meera Iyer",
          email: "meera.iyer@transitops.in",
          passwordHash: await hash("Pass@123"),
          role: "SAFETY_OFFICER",
        },
      }),
      prisma.user.upsert({
        where: { email: "arjun.mehta@transitops.in" },
        update: {},
        create: {
          name: "Arjun Mehta",
          email: "arjun.mehta@transitops.in",
          passwordHash: await hash("Pass@123"),
          role: "FINANCIAL_ANALYST",
        },
      }),
    ]);

  console.log("✅ Users seeded");

  /* ─────────────────────────────────────────
     2. VEHICLES
  ───────────────────────────────────────── */
  const [v1, v2, v3, v4, v5, v6] = await Promise.all([
    prisma.vehicle.upsert({
      where: { regNo: "GJ01AB4521" },
      update: {},
      create: {
        regNo: "GJ01AB4521",
        name: "VAN-05",
        type: "VAN",
        maxLoadCapacity: 500,
        odometer: 74000,
        acquisitionCost: 620000,
        status: "ON_TRIP",
      },
    }),
    prisma.vehicle.upsert({
      where: { regNo: "GJ01AB9978" },
      update: {},
      create: {
        regNo: "GJ01AB9978",
        name: "TRUCK-01",
        type: "TRUCK",
        maxLoadCapacity: 5000,
        odometer: 182000,
        acquisitionCost: 2450000,
        status: "AVAILABLE",
      },
    }),
    prisma.vehicle.upsert({
      where: { regNo: "GJ01AB8120" },
      update: {},
      create: {
        regNo: "GJ01AB8120",
        name: "MINI-03",
        type: "MINI_TRUCK",
        maxLoadCapacity: 1000,
        odometer: 66000,
        acquisitionCost: 410000,
        status: "IN_SHOP",
      },
    }),
    prisma.vehicle.upsert({
      where: { regNo: "GJ01AB0078" },
      update: {},
      create: {
        regNo: "GJ01AB0078",
        name: "VAN-09",
        type: "VAN",
        maxLoadCapacity: 750,
        odometer: 241900,
        acquisitionCost: 590000,
        status: "RETIRED",
      },
    }),
    prisma.vehicle.upsert({
      where: { regNo: "GJ05CD3345" },
      update: {},
      create: {
        regNo: "GJ05CD3345",
        name: "TRUCK-04",
        type: "TRUCK",
        maxLoadCapacity: 7000,
        odometer: 95000,
        acquisitionCost: 2800000,
        status: "ON_TRIP",
      },
    }),
    prisma.vehicle.upsert({
      where: { regNo: "GJ01EF6610" },
      update: {},
      create: {
        regNo: "GJ01EF6610",
        name: "VAN-12",
        type: "VAN",
        maxLoadCapacity: 500,
        odometer: 12000,
        acquisitionCost: 640000,
        status: "AVAILABLE",
      },
    }),
  ]);

  console.log("✅ Vehicles seeded");

  /* ─────────────────────────────────────────
     3. DRIVERS
  ───────────────────────────────────────── */
  const [d1, d2, d3, d4, d5] = await Promise.all([
    prisma.driver.upsert({
      where: { licenseNumber: "DL-88213" },
      update: {},
      create: {
        name: "Alex",
        licenseNumber: "DL-88213",
        licenseCategory: "LMV",
        licenseExpiry: new Date("2027-12-01"),
        contactNumber: "+91-9876500001",
        safetyScore: 96,
        status: "ON_TRIP",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-44120" },
      update: {},
      create: {
        name: "John",
        licenseNumber: "DL-44120",
        licenseCategory: "HMV",
        licenseExpiry: new Date("2025-03-20"),
        contactNumber: "+91-9922000002",
        safetyScore: 58,
        status: "SUSPENDED",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-77031" },
      update: {},
      create: {
        name: "Priya Verma",
        licenseNumber: "DL-77031",
        licenseCategory: "LMV",
        licenseExpiry: new Date("2026-08-15"),
        contactNumber: "+91-9911000003",
        safetyScore: 99,
        status: "ON_TRIP",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-90045" },
      update: {},
      create: {
        name: "Suresh",
        licenseNumber: "DL-90045",
        licenseCategory: "HMV",
        licenseExpiry: new Date("2027-01-10"),
        contactNumber: "+91-9744000004",
        safetyScore: 88,
        status: "OFF_DUTY",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-55210" },
      update: {},
      create: {
        name: "Divya Rao",
        licenseNumber: "DL-55210",
        licenseCategory: "LMV",
        licenseExpiry: new Date("2026-11-01"),
        contactNumber: "+91-9812000005",
        safetyScore: 92,
        status: "AVAILABLE",
      },
    }),
  ]);

  console.log("✅ Drivers seeded");

  /* ─────────────────────────────────────────
     4. TRIPS
  ───────────────────────────────────────── */
  await prisma.fuelLog.deleteMany({}); // Delete dependents first
  await prisma.trip.deleteMany({});

  await prisma.trip.createMany({
    data: [
      {
        tripCode: "TR001",
        source: "Gandhinagar Depot",
        destination: "Ahmedabad Hub",
        vehicleId: v1.id,
        driverId: d1.id,
        cargoWeight: 450,
        plannedDistance: 38,
        status: "DISPATCHED",
        dispatchedAt: new Date("2026-07-12T08:05:00Z"),
      },
      {
        tripCode: "TR002",
        source: "Vatva Industrial Area",
        destination: "Sanand Warehouse",
        vehicleId: v5.id,
        driverId: d3.id,
        cargoWeight: 3200,
        plannedDistance: 120,
        status: "DISPATCHED",
        dispatchedAt: new Date("2026-07-12T06:30:00Z"),
      },
      {
        tripCode: "TR003",
        source: "Naroda Depot",
        destination: "Vastral Yard",
        cargoWeight: 300,
        plannedDistance: 15,
        status: "DRAFT",
      },
      {
        tripCode: "TR004",
        source: "Manasa",
        destination: "Kalol Depot",
        vehicleId: v3.id,
        driverId: d5.id,
        cargoWeight: 600,
        plannedDistance: 42,
        status: "CANCELLED",
        cancellationReason: "Vehicle went to shop",
        dispatchedAt: new Date("2026-07-11T09:15:00Z"),
        cancelledAt: new Date("2026-07-11T10:00:00Z"),
      },
      {
        tripCode: "TR005",
        source: "Ahmedabad Hub",
        destination: "Gandhinagar Depot",
        vehicleId: v6.id,
        driverId: d4.id,
        cargoWeight: 200,
        plannedDistance: 38,
        fuelConsumedLiters: 4.8,
        finalOdometer: 12038,
        status: "COMPLETED",
        dispatchedAt: new Date("2026-07-11T07:00:00Z"),
        completedAt: new Date("2026-07-11T08:40:00Z"),
      },
      {
        tripCode: "TR006",
        source: "Sanand Warehouse",
        destination: "Vatva Industrial Area",
        vehicleId: v2.id,
        driverId: d2.id,
        cargoWeight: 4200,
        plannedDistance: 95,
        fuelConsumedLiters: 42,
        finalOdometer: 181500,
        status: "COMPLETED",
        dispatchedAt: new Date("2026-07-08T06:00:00Z"),
        completedAt: new Date("2026-07-08T09:20:00Z"),
      },
      {
        tripCode: "TR007",
        source: "Kalol Depot",
        destination: "Naroda Depot",
        vehicleId: v1.id,
        driverId: d1.id,
        cargoWeight: 380,
        plannedDistance: 30,
        fuelConsumedLiters: 6.2,
        finalOdometer: 73950,
        status: "COMPLETED",
        dispatchedAt: new Date("2026-07-10T07:30:00Z"),
        completedAt: new Date("2026-07-10T08:45:00Z"),
      },
    ],
  });
  console.log("✅ Trips seeded");

  /* ─────────────────────────────────────────
     5. MAINTENANCE LOGS
  ───────────────────────────────────────── */
  await prisma.maintenanceLog.deleteMany({});
  await prisma.maintenanceLog.createMany({
    data: [
      {
        vehicleId: v3.id,
        serviceType: "Tyre Replace",
        description: "Replaced front tyres",
        cost: 6200,
        status: "ACTIVE",
        date: new Date("2026-07-11"),
      },
      {
        vehicleId: v4.id,
        serviceType: "Engine Overhaul",
        cost: 18000,
        status: "COMPLETED",
        date: new Date("2026-05-02"),
        closedAt: new Date("2026-05-05"),
      },
      {
        vehicleId: v2.id,
        serviceType: "Oil Change",
        cost: 2500,
        status: "COMPLETED",
        date: new Date("2026-06-20"),
        closedAt: new Date("2026-06-21"),
      },
      {
        vehicleId: v1.id,
        serviceType: "Brake Inspection",
        cost: 1800,
        status: "COMPLETED",
        date: new Date("2026-06-01"),
        closedAt: new Date("2026-06-02"),
      },
    ],
  });
  console.log("✅ Maintenance records seeded");

  /* ─────────────────────────────────────────
     6. FUEL LOGS
  ───────────────────────────────────────── */
  // Notice we deleted FuelLogs before Trips, now we can reseed safely.
  const [t7, t6, t5, t2] = await Promise.all([
    prisma.trip.findUnique({ where: { tripCode: "TR007" } }),
    prisma.trip.findUnique({ where: { tripCode: "TR006" } }),
    prisma.trip.findUnique({ where: { tripCode: "TR005" } }),
    prisma.trip.findUnique({ where: { tripCode: "TR002" } }),
  ]);

  await prisma.fuelLog.createMany({
    data: [
      {
        vehicleId: v1.id,
        tripId: t7?.id,
        liters: 22,
        cost: 2850,
        date: new Date("2026-07-10"),
      },
      {
        vehicleId: v2.id,
        tripId: t6?.id,
        liters: 85,
        cost: 11000,
        date: new Date("2026-07-08"),
      },
      {
        vehicleId: v6.id,
        tripId: t5?.id,
        liters: 18,
        cost: 2340,
        date: new Date("2026-07-11"),
      },
      {
        vehicleId: v5.id,
        tripId: t2?.id,
        liters: 60,
        cost: 7800,
        date: new Date("2026-07-12"),
      },
      {
        vehicleId: v1.id,
        tripId: null,
        liters: 20,
        cost: 2600,
        date: new Date("2026-07-05"),
      },
    ],
  });
  console.log("✅ Fuel logs seeded");

  /* ─────────────────────────────────────────
     7. EXPENSES
  ───────────────────────────────────────── */
  await prisma.expense.deleteMany({});
  await prisma.expense.createMany({
    data: [
      {
        vehicleId: v1.id,
        type: "TOLL",
        amount: 150,
        date: new Date("2026-07-10"),
      },
      {
        vehicleId: v2.id,
        type: "TOLL",
        amount: 420,
        date: new Date("2026-07-08"),
      },
      {
        vehicleId: v5.id,
        type: "OTHER",
        amount: 300,
        date: new Date("2026-07-09"),
        description: "Parking",
      },
      {
        vehicleId: v3.id,
        type: "OTHER",
        amount: 1200,
        date: new Date("2026-07-11"),
        description: "Towing to service center",
      },
    ],
  });
  console.log("✅ Expenses seeded");

  /* ─────────────────────────────────────────
     8. SYSTEM SETTINGS & ROLE PERMISSIONS
  ───────────────────────────────────────── */
  await prisma.systemSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      licenseAlertDays: 30,
      currency: "INR",
      distanceUnit: "km",
    },
  });

  await prisma.rolePermission.deleteMany({});

  const rolePermissions: any = [];
  const roles = [
    "FLEET_MANAGER",
    "DISPATCHER",
    "SAFETY_OFFICER",
    "FINANCIAL_ANALYST",
  ];
  const modules = [
    "DASHBOARD",
    "FLEET",
    "DRIVERS",
    "TRIPS",
    "MAINTENANCE",
    "FUEL_EXPENSES",
    "ANALYTICS",
    "SETTINGS",
  ];

  // Seed default base viewing rights
  for (const role of roles) {
    for (const mod of modules) {
      rolePermissions.push({
        role: role,
        module: mod,
        canView: true,
        canEdit: false,
      });
    }
  }
  await prisma.rolePermission.createMany({ data: rolePermissions });
  console.log("✅ System settings & RBAC seeded");

  /* ─────────────────────────────────────────
     Summary
  ───────────────────────────────────────── */
  console.log("\n🎉 Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Login credentials:");
  console.log("  raven.k@transitops.in       → Pass@123  (DISPATCHER)");
  console.log("  kavya.nair@transitops.in    → Pass@123  (FLEET_MANAGER)");
  console.log("  meera.iyer@transitops.in    → Pass@123  (SAFETY_OFFICER)");
  console.log("  arjun.mehta@transitops.in   → Pass@123  (FINANCIAL_ANALYST)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
