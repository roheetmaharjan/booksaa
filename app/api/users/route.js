import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      include:{
        role: true,
      }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: `${user.firstname} ${user.lastname}`,
      joinedAt: new Date(user.joinedAt).toLocaleDateString('en-NP',{
        timeZone : 'Asia/Kathmandu'
      }),
      role: user.role?.name || 'UNKNOWN',
      status: user.status,
    }));

    return new NextResponse(JSON.stringify(formattedUsers), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Error Fetching users", err);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
    });
  }
}
