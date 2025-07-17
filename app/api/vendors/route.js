import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const vendors = await prisma.vendors.findMany();
    return new Response(JSON.stringify(vendors), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error fetching data", error);
    return new Response(
      JSON.stringify(
        { error: "Error fetching data" },
        {
          status: 500,
        }
      )
    );
  }
}
