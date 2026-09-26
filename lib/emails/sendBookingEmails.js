import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPaymentLinkEmail(customerEmail, customerName, bookings, paymentLink, depositRequired) {
  if (!customerEmail) return;

  const transporter = getTransporter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Build services details list
  const servicesList = bookings
    .map(
      (b) =>
        `<li><strong>${b.serviceName}</strong> with ${b.professionalName} on ${new Date(
          b.scheduledAt
        ).toLocaleDateString()} at ${b.startTime} (Price: Rs. ${b.price})</li>`
    )
    .join("");

  await transporter.sendMail({
    from: '"Booksaa" <no-reply@yourapp.com>',
    to: customerEmail,
    subject: "Action Required: Complete Payment for Your Booking",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background-color: #fff;">
        <h2 style="color: #062B3D; border-bottom: 2px solid #062B3D; padding-bottom: 8px;">Your Booking Details</h2>
        <p>Hello ${customerName || "Customer"},</p>
        <p>Your appointment has been created and is pending payment. Please complete the deposit to confirm your booking.</p>
        
        <h3 style="color: #0f172a;">Requested Services:</h3>
        <ul style="padding-left: 20px;">
          ${servicesList}
        </ul>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #475569;">Required Deposit:</p>
          <p style="margin: 4px 0 16px 0; font-size: 28px; font-weight: bold; color: #062B3D;">Rs. ${depositRequired.toLocaleString()}</p>
          <a href="${paymentLink}" style="display: inline-block; background-color: #062B3D; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Pay Now to Confirm</a>
        </div>

        <p style="font-size: 12px; color: #ef4444; font-weight: bold;">Note: This payment link will expire in 30 minutes. If payment is not completed, your booking will be cancelled automatically.</p>
        
        <p>Thank you,</p>
        <p>The Booksaa Team</p>
      </div>
    `,
  });
}

export async function sendBookingConfirmationEmail(customerEmail, customerName, bookings) {
  if (!customerEmail) return;

  const transporter = getTransporter();

  const servicesList = bookings
    .map(
      (b) =>
        `<li><strong>${b.serviceName}</strong> with ${b.professionalName} on ${new Date(
          b.scheduledAt
        ).toLocaleDateString()} at ${b.startTime}</li>`
    )
    .join("");

  await transporter.sendMail({
    from: '"Booksaa" <no-reply@yourapp.com>',
    to: customerEmail,
    subject: "Appointment Confirmed!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background-color: #fff;">
        <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 8px;">Your Booking is Confirmed!</h2>
        <p>Hello ${customerName || "Customer"},</p>
        <p>We are pleased to inform you that your appointment has been successfully confirmed. Here are your booking details:</p>
        
        <h3 style="color: #0f172a;">Scheduled Appointments:</h3>
        <ul style="padding-left: 20px;">
          ${servicesList}
        </ul>

        <p>Please arrive 10 minutes prior to your scheduled time. If you need to reschedule or cancel, please contact the business directly.</p>
        
        <p>Thank you,</p>
        <p>The Booksaa Team</p>
      </div>
    `,
  });
}
