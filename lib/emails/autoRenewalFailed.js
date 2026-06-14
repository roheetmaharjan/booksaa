import { transporter } from '@/utils/mailer';

export async function sendAutoRenewalFailed({
  email,
  vendorName,
  error,
  retryDate,
}) {
  const htmlContent = `
    <h2>Subscription Renewal Failed - Action Required</h2>
    <p>Hi ${vendorName},</p>
    <p>We attempted to automatically renew your subscription, but the payment failed.</p>

    <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p><strong>Reason:</strong> ${error || 'Payment declined by your bank'}</p>
    </div>

    <h3>What You Need to Do:</h3>
    <ol>
      <li>Log in to your Booksaa account</li>
      <li>Go to Billing & Usage settings</li>
      <li>Update your payment method</li>
      <li>Retry the payment or enable auto-renewal again</li>
    </ol>

    <p><strong>Next Automatic Retry:</strong> ${retryDate.toLocaleDateString()}</p>

    <p>If you prefer, you can manually process the payment now by logging into your account. If you have any questions or need assistance, please contact our support team.</p>

    <p>Best regards,<br/>The Booksaa Team</p>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Action Required: Subscription Renewal Failed',
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
}
