import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const results = await prisma.service.findMany();
    return new Response(JSON.stringify(results), {
      status: "200",
      headers: {
        "Cotent-Type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    console.error("Error Fetching data", err);
    return new Response(
      JSON.stringify(
        { error: "Error fetching" },
        {
          status: "200",
        }
      )
    );
  }
}
