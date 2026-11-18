import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await prisma.demoRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Demo request listing failed:", error);
    return NextResponse.json({ error: "Unable to load demo requests." }, { status: 500 });
  }
}
