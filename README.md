This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started
First, Create a database in Postgresql:

Second, run database migration 

```bash
# for local
npx prisma migrate dev

# for production
npx prisma migrate deploy



```
Third, seed the Databse

```bash
npm run seed
```


Forth, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Form Service integration

Booksaa administrators can open the Form Service builder from **Admin → Forms**. Configure these server-only variables in Booksaa (do not prefix them with `NEXT_PUBLIC_`):

```env
FORM_SERVICE_URL=http://localhost:4000
FORM_SERVICE_PARTNER_CLIENT_ID=<Booksaa partner client ID>
FORM_SERVICE_PARTNER_CLIENT_SECRET=<Booksaa partner client secret>
```

In the Form Service platform admin, generate the Booksaa partner API credentials, enable API access, and ensure the partner has enabled access and an eligible subscription. Copy the client ID and one-time client secret into Booksaa's private environment, then restart both apps. The Form Service derives the tenant ID from the credential; do not configure or send `X-Company-Id` from Booksaa.

Set `FORM_SERVICE_PUBLIC_URL` in the Form Service to its browser-accessible URL. Use HTTPS for deployed environments. The Booksaa integration keeps partner credentials on the server and creates a short-lived builder session for the signed-in Booksaa administrator.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
