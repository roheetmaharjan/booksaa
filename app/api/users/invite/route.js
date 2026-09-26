import { transporter } from "@/utils/mailer";

export async function POST(request) {
  try {
    const { firstname, lastname, email, role } = await request.json();

    // Email content
    const mailOptions = {
      from: `"Booksaa" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "You're Invited to Booksaa!",
      html: `
        <p>Hello ${firstname} ${lastname},</p>
        <p>You have been invited to join Booksaa as a <b>${role}</b>.</p>
        <p>Please click the link below to set up your account:</p>
        <a href="${process.env.NEXTAUTH_URL}/auth/login">Accept Invitation</a>
        <p>If you did not expect this invitation, you can ignore this email.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error sending invite email:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}