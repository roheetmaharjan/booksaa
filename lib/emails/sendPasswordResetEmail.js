import { transporter } from "@/utils/mailer";

export async function sendPasswordResetEmail(email, token) {
  const appUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const resetUrl = new URL("/auth/reset-password", appUrl);
  resetUrl.searchParams.set("token", token);

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Reset your Booksaa password",
    text: `Use this link to reset your Booksaa password. This link expires in one hour:\n\n${resetUrl.toString()}`,
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your Booksaa password. Click below to choose a new password. This link expires in one hour.</p>
      <p><a href="${resetUrl.toString()}" style="display:inline-block;padding:12px 20px;background:#062B3D;color:#ffffff;text-decoration:none;border-radius:6px">Reset password</a></p>
      <p>If you did not request a password reset, you can ignore this email.</p>
    `,
  });
}
