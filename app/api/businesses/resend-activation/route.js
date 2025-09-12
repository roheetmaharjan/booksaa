import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendInviteEmail } from "@/lib/sendInviteEmail";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Optional: don't resend if already active
    if (user.status === "ACTIVE") {
      return NextResponse.json({ error: "User is already active" }, { status: 400 });
    }

    const token = uuidv4();

    await prisma.invitation.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
      },
    });

    await sendInviteEmail(email, token);

    return NextResponse.json({ success: true, message: "Activation link sent." });
  } catch (error) {
    console.error("Resend activation error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
