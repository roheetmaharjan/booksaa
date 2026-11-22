import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/emails/sendPasswordResetEmail";
import { createPasswordResetToken } from "@/utils/passwordReset";

const TOKEN_LIFETIME_MS = 60 * 60 * 1000;

export async function POST(request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const user = await prisma.users.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account was found with that email address." },
        { status: 404 },
      );
    }

    const { token, tokenHash } = createPasswordResetToken();
    const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (error) {
      await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
      console.error("Password reset email failed:", error);
      return NextResponse.json(
        { error: "Unable to send the password reset email. Please try again later." },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Password reset email sent." });
  } catch (error) {
    console.error("Password reset request failed:", error);
    return NextResponse.json(
      { error: "Unable to process the password reset request." },
      { status: 500 },
    );
  }
}
