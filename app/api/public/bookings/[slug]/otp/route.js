import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOtpChallenge, createVerifiedEmailToken, verifyOtpChallenge } from "@/lib/guest-booking-otp";
import { isGuestBookingEmailConfigured, sendGuestBookingOtpEmail } from "@/lib/emails/guestBooking";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!emailPattern.test(email)) {
      return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
    }

    const business = await prisma.vendors.findFirst({
      where: { slug },
      select: { name: true },
    });
    if (!business) {
      return NextResponse.json({ success: false, message: "Business not found." }, { status: 404 });
    }

    const emailConfigured = isGuestBookingEmailConfigured();
    if (!emailConfigured && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, message: "Email verification is not configured. Please try again later." }, { status: 503 });
    }

    if (process.env.NODE_ENV === "production" && !process.env.GUEST_BOOKING_OTP_SECRET) {
      return NextResponse.json({ success: false, message: "Email verification is not configured. Please try again later." }, { status: 503 });
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const challengeToken = createOtpChallenge(email, code);

    if (emailConfigured) {
      await sendGuestBookingOtpEmail({ email, code, businessName: business.name });
      return NextResponse.json({ success: true, challengeToken, mode: "email" });
    }

    return NextResponse.json({
      success: true,
      challengeToken,
      mode: "development-mock",
      mockCode: code,
    });
  } catch (error) {
    console.error("Guest booking OTP send failed:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Unable to send the verification code." },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const { challengeToken, code } = await request.json();
    const email = verifyOtpChallenge(challengeToken, String(code || ""));

    if (!email) {
      return NextResponse.json({ success: false, message: "The code is invalid or expired. Request a new code and try again." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      verifiedEmailToken: createVerifiedEmailToken(email),
      email,
    });
  } catch (error) {
    console.error("Guest booking OTP verification failed:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Unable to verify the email address." },
      { status: 500 },
    );
  }
}
