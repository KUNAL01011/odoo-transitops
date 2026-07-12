import { prisma } from "@/configs";

export const analyticsService = {
  /* ---- Dashboard KPIs ---- */
  async getDashboard(filters?: { region?: string; type?: string }) {
    const vehicleWhere = {
      ...(filters?.region && { region: filters.region }),
      ...(filters?.type && { type: filters.type as any }),
    };

    const [
      totalVehicles,
      availableVehicles,
      onTripVehicles,
      inShopVehicles,
      retiredVehicles,
      totalDrivers,
      onDutyDrivers,
      activeTrips,
      pendingTrips,
    ] = await Promise.all([
      prisma.vehicle.count({ where: vehicleWhere }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: "AVAILABLE" } }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: "ON_TRIP" } }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: "IN_SHOP" } }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: "RETIRED" } }),
      prisma.driver.count(),
      prisma.driver.count({ where: { status: "ON_TRIP" } }),
      prisma.trip.count({ where: { status: "DISPATCHED" } }),
      prisma.trip.count({ where: { status: "DRAFT" } }),
    ]);

    const activeVehicles = totalVehicles - retiredVehicles;
    const fleetUtilizationPct =
      activeVehicles > 0
        ? Math.round((onTripVehicles / activeVehicles) * 100)
        : 0;

    // Licenses expiring within 30 days
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const expiringLicenses = await prisma.driver.count({
      where: { licenseExpiry: { lte: thirtyDays, gte: new Date() } },
    });

    return {
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        onTrip: onTripVehicles,
        inShop: inShopVehicles,
        retired: retiredVehicles,
        active: activeVehicles,
      },
      drivers: {
        total: totalDrivers,
        onDuty: onDutyDrivers,
        expiringLicenses,
      },
      trips: {
        active: activeTrips,
        pending: pendingTrips,
      },
      fleetUtilizationPct,
    };
  },

  /* ---- Analytics Report ---- */
  async getReport(from?: string, to?: string) {
    const dateFilter = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    };
    const hasDateFilter = from || to;

    /* All vehicles with their trips, fuel, maintenance, expenses */
    const vehicles = await prisma.vehicle.findMany({
      include: {
        trips: {
          where: {
            status: "COMPLETED",
            ...(hasDateFilter && { completedAt: dateFilter }),
          },
          select: {
            id: true,
            actualDistance: true,
            fuelConsumed: true,
          },
        },
        fuelLogs: {
          where: hasDateFilter ? { date: dateFilter } : {},
          select: { liters: true, cost: true },
        },
        maintenanceLogs: {
          where: hasDateFilter ? { startedAt: dateFilter } : {},
          select: { cost: true },
        },
        expenses: {
          where: hasDateFilter ? { date: dateFilter } : {},
          select: { amount: true },
        },
      },
    });

    const report = vehicles.map(v => {
      const totalFuelCost = v.fuelLogs.reduce((s, f) => s + f.cost, 0);
      const totalMaintenanceCost = v.maintenanceLogs.reduce(
        (s, m) => s + m.cost,
        0
      );
      const totalOtherExpenses = v.expenses.reduce((s, e) => s + e.amount, 0);
      const totalCost =
        totalFuelCost + totalMaintenanceCost + totalOtherExpenses;

      const totalDistance = v.trips.reduce(
        (s, t) => s + (t.actualDistance ?? 0),
        0
      );
      const totalFuelLiters = v.fuelLogs.reduce((s, f) => s + f.liters, 0);
      const fuelEfficiency =
        totalFuelLiters > 0
          ? +(totalDistance / totalFuelLiters).toFixed(2)
          : null; // km/L

      // ROI = (Revenue - (Maintenance + Fuel)) / AcquisitionCost
      // Revenue proxy: we don't have explicit revenue, so expose raw numbers for UI
      const roi =
        v.acquisitionCost > 0
          ? +(
              (0 - (totalMaintenanceCost + totalFuelCost)) /
              v.acquisitionCost
            ).toFixed(4)
          : null;

      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        name: v.name,
        type: v.type,
        status: v.status,
        acquisitionCost: v.acquisitionCost,
        completedTrips: v.trips.length,
        totalDistance,
        totalFuelLiters,
        totalFuelCost,
        totalMaintenanceCost,
        totalOtherExpenses,
        totalOperationalCost: totalCost,
        fuelEfficiencyKmPerLiter: fuelEfficiency,
        roi,
      };
    });

    // Fleet-level aggregates
    const fleetSummary = {
      totalOperationalCost: report.reduce(
        (s, r) => s + r.totalOperationalCost,
        0
      ),
      totalFuelCost: report.reduce((s, r) => s + r.totalFuelCost, 0),
      totalMaintenanceCost: report.reduce(
        (s, r) => s + r.totalMaintenanceCost,
        0
      ),
      totalDistance: report.reduce((s, r) => s + r.totalDistance, 0),
      totalCompletedTrips: report.reduce((s, r) => s + r.completedTrips, 0),
    };

    return { vehicles: report, fleetSummary };
  },
};
