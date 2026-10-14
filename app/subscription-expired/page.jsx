import SubscriptionExpiredPage from "@/components/business/SubscriptionExpiredPage";

export default async function SubscriptionExpiredRoute({ searchParams }) {
  const { businessSlug } = await searchParams;
  return <SubscriptionExpiredPage businessSlug={businessSlug || ""} />;
}
