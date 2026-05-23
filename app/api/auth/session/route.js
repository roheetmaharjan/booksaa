import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getCurrentSession();
  return NextResponse.json(sessionUser ? { user: sessionUser } : null);
}
