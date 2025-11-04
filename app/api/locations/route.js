import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const location = await prisma.location.findMany({
      select: {
        id: true,
        address: true,
      },
    });


    return new NextResponse(JSON.stringify(location), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error fetching data", error);
    return new NextResponse(
      JSON.stringify({ error: "Error fetching data" }),
      { status: 500 }
    );
  }
}