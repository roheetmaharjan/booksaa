import transporter  from '@/utils/mailer';

export async function sendSubscriptionUpgradeEmail({
  email,
  vendorName,
  planName,
  amount,
  expiryDate,
}) {
  const htmlContent = `
    <h2>Subscription Upgrade Successful!</h2>
    <p>Hi ${vendorName},</p>
    <p>Your subscription has been successfully upgraded to the <strong>${planName}</strong> plan.</p>

    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Plan Details:</strong></p>
      <p>Plan: ${planName}</p>
      <p>Amount Charged: $${amount.toFixed(2)}</p>
      <p>Subscription Expires: ${expiryDate.toLocaleDateString()}</p>
    </div>

    <p>Your subscription will automatically renew unless you disable auto-renewal in your account settings.</p>

    <p>If you have any questions or need to make changes to your subscription, please contact our support team.</p>

    <p>Best regards,<br/>The Booksaa Team</p>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: `Subscription Upgraded - ${planName} Plan`,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
}
