import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { firstname, lastname, email, role } = await request.json();

    // Create a transporter using your SMTP credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Bookaroo" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "You're Invited to Bookaroo!",
      html: `
        <p>Hello ${firstname} ${lastname},</p>
        <p>You have been invited to join Bookaroo as a <b>${role}</b>.</p>
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