# Stripe Payment Integration - Setup Guide

## Environment Variables

Add these to your `.env` and `.env.local` files:

```env
# Stripe API Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_... for production

# Stripe Webhook Signing Secret (from Webhooks section)
STRIPE_WEBHOOK_SECRET=whsec_...

# Cron Job Secret (for auto-renewal scheduler)
CRON_SECRET=your_secure_random_secret_here
```

## Setup Instructions

### 1. Database Migration
The database schema has been automatically updated when you deployed. No additional migration is needed.

### 2. Install Stripe React Components
The project needs the Stripe React library for the payment form. Run:

```bash
npm install @stripe/react-stripe-js @stripe/js
```

### 3. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Log in or create an account
3. Navigate to **Developers** → **API Keys**
4. Copy your **Publishable Key** and **Secret Key**
5. For test mode: keys start with `pk_test_` and `sk_test_`
6. For production: keys start with `pk_live_` and `sk_live_`

### 4. Configure Stripe in Admin Panel

1. Go to **Admin** → **Settings** → **Payments**
2. Paste your Stripe keys
3. Choose **Test Mode** for development (recommended)
4. Click **Save Configuration**

### 5. Set Up Webhooks (Important!)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add an endpoint**
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`
   - `payment_method.detached`
5. Click **Add events** and then **Create endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to your `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### 6. Set Up Auto-Renewal Scheduler

The auto-renewal system requires a scheduled task to run daily. Choose one option:

#### Option A: Vercel Cron (Recommended for Vercel deployments)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/auto-renewal",
    "schedule": "0 0 * * *"
  }]
}
```

#### Option B: External Scheduler (e.g., Upstash)

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a QStash Queue
3. Set up a scheduled task:
   - **URL**: `https://yourdomain.com/api/cron/auto-renewal`
   - **Schedule**: `0 0 * * *` (daily at midnight UTC)
   - **Header**: `Authorization: Bearer your_cron_secret`

#### Option C: Cloud Function (AWS Lambda, Google Cloud Functions, etc.)

Create a function that calls:
```
POST https://yourdomain.com/api/cron/auto-renewal
Header: Authorization: Bearer your_cron_secret
```
Schedule it to run daily.

### 7. Test the Integration

#### Test Stripe Credentials

For testing, use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

#### Test Workflow

1. **Admin**: Go to **Admin** → **Settings** → **Payments** and verify Stripe is configured
2. **Business Owner**: Go to **Dashboard** and click **Upgrade Plan**
3. **Plan Selection**: Select a different plan
4. **Payment**: Use test card 4242 4242 4242 4242
5. **Expiry Date**: Use any future date (e.g., 12/25)
6. **CVC**: Use any 3 digits
7. **Confirmation**: Check that payment succeeds

### 8. Email Configuration

The system uses Nodemailer with Gmail SMTP (already configured).

Ensure your `.env` has:
```env
SMTP_USER=swift.rohit13@gmail.com
SMTP_PASS=omhhcokcijttnwyk
```

Emails are sent for:
- Subscription upgrade successful
- Auto-renewal successful
- Auto-renewal failed (with retry info)
- Subscription expiring soon (warning if no card saved)

## Features Implemented

### Admin Portal
- **Payment Settings**: Configure Stripe credentials
- **Test/Live Mode**: Toggle between test and production
- **Webhook Instructions**: Setup guide built into the UI

### Business Portal
- **Dashboard**: Shows subscription status with upgrade button
- **Billing & Usage Page**:
  - Current subscription details
  - Payment method management (add/remove/set default)
  - Auto-renewal toggle
  - Billing history
  - Expiry warnings

- **Upgrade Flow**:
  - Plan selector with feature comparison
  - Secure payment form using Stripe Payment Element
  - Card saving option for auto-renewal
  - Success confirmation with receipt email

### Backend Services
- **Payment Processing**: Create and confirm payment intents
- **Auto-Renewal**: Daily scheduled task for automatic charges
- **Payment History**: Track all transactions
- **Email Notifications**: Confirmation, warnings, and failure alerts
- **Webhook Handlers**: Process Stripe events for audit trail

## Database Schema

Three new models were added:

1. **StripeAccount**: Stores admin Stripe credentials
2. **VendorPaymentMethod**: Maps saved payment methods to businesses
3. **SubscriptionPaymentHistory**: Tracks all payment transactions

Five model fields were added to **Vendors**:
- `stripeCustomerId`: Stripe customer ID
- `subscriptionExpiresAt`: When subscription expires
- `autoRenewEnabled`: Auto-renewal toggle
- `lastPaymentAttemptAt`: Last payment attempt timestamp

## API Endpoints Summary

### Admin Endpoints
```
POST   /api/admin/stripe/setup      - Configure Stripe keys
GET    /api/admin/stripe/status     - Get Stripe setup status
```

### Business Endpoints
```
POST   /api/business/checkout/create-session        - Create payment intent
POST   /api/business/checkout/confirm-payment       - Confirm and process payment
GET    /api/business/payment-methods/list           - List saved cards
DELETE /api/business/payment-methods/[methodId]     - Delete a card
PUT    /api/business/auto-renewal/toggle            - Enable/disable auto-renewal
```

### Scheduled Tasks
```
GET    /api/cron/auto-renewal       - Run auto-renewal process (called daily)
```

### Webhooks
```
POST   /api/webhooks/stripe         - Stripe event handler
```

## Production Deployment Checklist

- [ ] Create Stripe account for your business
- [ ] Get live API keys from Stripe Dashboard
- [ ] Configure HTTPS on your domain (required for Stripe)
- [ ] Add live keys to production `.env`
- [ ] Set up webhook with production URL
- [ ] Test one full payment cycle with live keys
- [ ] Set up daily cron job for auto-renewal
- [ ] Configure email sender address for production
- [ ] Monitor Stripe Dashboard for failed payments
- [ ] Set up alerts for webhook failures
- [ ] Document your Stripe Secret Key in a secure vault

## Troubleshooting

### "Stripe account not configured"
- Go to Admin → Settings → Payments and configure Stripe keys
- Verify keys are correct (test vs live mode)

### "Payment failed"
- Check Stripe Dashboard for transaction details
- Ensure webhook is properly configured and responding
- Verify database has correct Stripe customer ID

### "Auto-renewal not working"
- Check that cron job is running (view logs)
- Verify CRON_SECRET environment variable is set
- Check that vendor has a default payment method saved
- Look for email notifications about renewal attempts

### "Email not sending"
- Verify SMTP credentials in `.env`
- Check spam folder for emails
- Ensure email recipient is correct

## Support

For Stripe-specific issues, visit:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For application issues:
- Check server logs for errors
- Verify all environment variables are set
- Ensure database migrations have run
