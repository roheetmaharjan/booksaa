import { redirect } from "next/navigation";

export default async function LegacySubscriptionExpiredPage({ params }) {
  const { slug } = await params;
  redirect(`/subscription-expired?businessSlug=${encodeURIComponent(slug)}`);
}