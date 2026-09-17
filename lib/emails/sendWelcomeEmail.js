import nodemailer from "nodemailer";

export async function sendWelcomeEmail(email, name) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Booksaa" <no-reply@yourapp.com>',
    to: email,
    subject: "Welcome to Booksaa",
    html: `
      <p>Hello${name ? ` ${name}` : ""},</p>
      <p>Welcome to Booksaa. Your business account is ready, and you can now manage your profile, services, professionals, locations, and bookings.</p>
      <p><a href="${appUrl}/vendor">Open your dashboard</a></p>
      <p>Thanks for joining Booksaa.</p>
    `,
  });
}
