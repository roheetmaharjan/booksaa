import { transporter } from '@/utils/mailer';

export async function sendSubscriptionWarning({
  email,
  vendorName,
  expiryDate,
}) {
  const htmlContent = `
    <h2>Your Subscription is Expiring Soon</h2>
    <p>Hi ${vendorName},</p>
    <p>Your Booksaa subscription is expiring on <strong>${expiryDate.toLocaleDateString()}</strong> (in 7 days).</p>

    <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p><strong>⚠️ Action Required:</strong> We don't have a saved payment method on file for automatic renewal.</p>
    </div>

    <h3>To Keep Your Subscription Active:</h3>
    <ol>
      <li>Log in to your Booksaa account</li>
      <li>Go to Billing & Usage settings</li>
      <li>Add or update your payment method</li>
      <li>Your subscription will automatically renew</li>
    </ol>

    <p>If you don't add a payment method before the expiry date, your subscription will lapse and you'll lose access to your account.</p>

    <p>Need help? Contact our support team - we're here to assist!</p>

    <p>Best regards,<br/>The Booksaa Team</p>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your Booksaa Subscription Expiring Soon - Action Required',
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
}
