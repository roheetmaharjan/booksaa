import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const locationId = searchParams.get("locationId");
    const professionalId = searchParams.get("professionalId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const vendorId = searchParams.get("vendorId");

    // Build filter object
    const where = {};

    if (vendorId) {
      try {
        // Get all professionals for this vendor
        const professionals = await prisma.professional.findMany({
          where: { vendorId },
          select: { id: true },
        });
        where.professionalId = { in: professionals.map((p) => p.id) };
      } catch (error) {
        console.error("Error fetching professionals:", error);
      }
    }

    if (professionalId) {
      where.professionalId = professionalId;
    }

    if (locationId) {
      where.locationId = locationId;
    }

    // Date range filtering
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.date.lt = end;
      }
    }

    // Fetch bookings with relations
    const bookings = await prisma.bookings.findMany({
      where,
      include: {
        service: true,
        professional: {
          include: {
            role: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return Response.json({ bookings: bookings || [] }, { status: 200 });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    // Return empty array on error instead of failing
    return Response.json({ bookings: [] }, { status: 200 });
  }
}
