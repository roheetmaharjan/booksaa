import { transporter } from '@/utils/mailer';

export async function sendAutoRenewalSuccess({
  email,
  vendorName,
  planName,
  amount,
  expiryDate,
}) {
  const htmlContent = `
    <h2>Subscription Auto-Renewed Successfully!</h2>
    <p>Hi ${vendorName},</p>
    <p>Your subscription has been automatically renewed for another billing cycle.</p>

    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Renewal Details:</strong></p>
      <p>Plan: ${planName}</p>
      <p>Amount Charged: $${amount.toFixed(2)}</p>
      <p>New Expiry Date: ${expiryDate.toLocaleDateString()}</p>
    </div>

    <p>Your account is now active and ready to use. If you did not authorize this charge or have any questions, please contact our support team immediately.</p>

    <p>You can manage your auto-renewal settings in your account dashboard at any time.</p>

    <p>Best regards,<br/>The Booksaa Team</p>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: `Subscription Auto-Renewed - ${planName} Plan`,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
}
