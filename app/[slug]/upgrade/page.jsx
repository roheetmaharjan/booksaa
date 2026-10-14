import { redirect } from "next/navigation";

export default async function LegacyUpgradeRoute({ params }) {
  const { slug } = await params;
  redirect(`/upgrade?businessSlug=${encodeURIComponent(slug)}&returnTo=${encodeURIComponent(`/${slug}/billing-usage`)}`);
}
