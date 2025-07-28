import nodemailer from "nodemailer";

export async function sendInviteEmail(email, token) {
  const link = `http://localhost:3000//setup-profile?token=${token}`;

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
    subject: "Complete Your Vendor Profile",
    html: `
      <p>Hello,</p>
      <p>You’ve been invited as a vendor. Click the button below to set up your account:</p>
      <a href="${link}">Set Up Profile</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
}
