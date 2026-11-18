import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPasswordResetToken } from "@/utils/passwordReset";

export async function POST(request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const confirmPassword =
      typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

    if (!token) {
      return NextResponse.json(
        { error: "This password reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 },
      );
    }

    const tokenHash = hashPasswordResetToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { userId: true, expiresAt: true },
    });

    if (!resetToken || resetToken.expiresAt <= new Date()) {
      if (resetToken) {
        await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
      }
      return NextResponse.json(
        { error: "This password reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updated = await prisma.$transaction(async (transaction) => {
      const consumedToken = await transaction.passwordResetToken.deleteMany({
        where: { tokenHash, expiresAt: { gt: new Date() } },
      });

      if (consumedToken.count !== 1) {
        return false;
      }

      await transaction.users.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });
      return true;
    });

    if (!updated) {
      return NextResponse.json(
        { error: "This password reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Password reset failed:", error);
    return NextResponse.json(
      { error: "Unable to reset the password. Please try again." },
      { status: 500 },
    );
  }
}
