import nodemailer from "nodemailer";

import { guestBookingConfirmationTemplate, guestBookingOtpTemplate } from "@/lib/emails/guestBookingTemplates";

export function isGuestBookingEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isGuestBookingEmailConfigured()) {
    throw new Error("Configure SMTP_HOST, SMTP_USER, and SMTP_PASS to send guest booking email.");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function getFromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER;
}

export async function sendGuestBookingOtpEmail({ email, code, businessName }) {
  await getTransporter().sendMail({
    from: getFromAddress(),
    to: email,
    subject: `Verify your email for ${businessName}`,
    html: guestBookingOtpTemplate(code, businessName),
  });
}

export async function sendGuestBookingConfirmationEmail({ email, ...booking }) {
  await getTransporter().sendMail({
    from: getFromAddress(),
    to: email,
    subject: `Appointment confirmed with ${booking.businessName}`,
    html: guestBookingConfirmationTemplate(booking),
  });
}
