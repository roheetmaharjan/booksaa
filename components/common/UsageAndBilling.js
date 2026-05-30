"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UsageIndicatorCard from "./UsageIndicatorCard";
import { Users, MapPin } from "@phosphor-icons/react";

export default function UsageAndBilling({
  business,
  plan,
  onAddProfessionals,
  onAddLocations,
}) {
  const billing = business?.billingSummary;
  const professionals = business?.professionals || [];
  const locations = business?.locations || [];

  // Professional
  const subscriptionProfessionalLimit = Number(
    business?.subscriptionProfessionalLimit ?? billing?.professionalCount ?? plan?.professional ?? 1
  );
  const currentProfessionalCount = Number(
    billing?.actualProfessionalCount ?? professionals.length ?? 0
  );
  const canAddProfessionalsAddon = currentProfessionalCount >= subscriptionProfessionalLimit;

  // Location
  const subscriptionLocationLimit = Number(
    business?.subscriptionLocationLimit ?? billing?.activeLocationCount ?? plan?.location ?? 1
  );
  const currentLocationCount = Number(
    billing?.actualLocationCount ??
      locations.filter((location) => location.isActive !== false).length ??
      0
  );
  const canAddLocationsAddon = currentLocationCount >= subscriptionLocationLimit;
  const extraProfessionalPrice = plan?.extraProfessionalPrice;
  const extraLocationPrice = plan?.extraLocationPrice;

  return (
    <div className="space-y-6">
      {/* Plan Overview Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl">Your {plan?.name || "Current"} Plan</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Monthly billing: <span className="font-semibold text-foreground">${billing?.totalPrice || "0"} / {billing?.billingCycle || "month"}</span>
          </p>
        </CardHeader>
      </Card>

      {/* Current Usage Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Current Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UsageIndicatorCard
            title="Professionals"
            icon={Users}
            currentUsage={currentProfessionalCount}
            limit={subscriptionProfessionalLimit}
            price={extraProfessionalPrice}
            description={`Add more professionals to your team`}
            onAddMore={canAddProfessionalsAddon ? onAddProfessionals : undefined}
          />
          <UsageIndicatorCard
            title="Locations"
            icon={MapPin}
            currentUsage={currentLocationCount}
            limit={subscriptionLocationLimit}
            price={extraLocationPrice}
            description={`Add more business locations`}
            onAddMore={canAddLocationsAddon ? onAddLocations : undefined}
          />
        </div>
      </div>

      {/* Billing Summary */}
      {billing && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Base Subscription</p>
                <p className="text-lg font-semibold">${billing.basePrice} / {billing.billingCycle}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Included Professionals</p>
                <p className="text-lg font-semibold">
                  {subscriptionProfessionalLimit} professional{subscriptionProfessionalLimit !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Included Locations</p>
                <p className="text-lg font-semibold">
                  {subscriptionLocationLimit} location{subscriptionLocationLimit !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="space-y-1 border-l pl-4">
                <p className="text-sm text-muted-foreground">Estimated Total</p>
                <p className="text-2xl font-bold text-blue-600">${billing.totalPrice}</p>
                <p className="text-xs text-muted-foreground">per {billing.billingCycle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>{`What's Included in ${plan?.name || "Your Plan"}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Users className="w-5 h-5 text-green-600 mt-1" />
              </div>
              <div>
                <p className="font-medium">{subscriptionProfessionalLimit} Professionals</p>
                <p className="text-sm text-muted-foreground">
                  ${extraProfessionalPrice} per additional professional
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-600 mt-1" />
              </div>
              <div>
                <p className="font-medium">{subscriptionLocationLimit} Locations</p>
                <p className="text-sm text-muted-foreground">
                  ${extraLocationPrice} per additional location
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Suggestion */}
      {(currentProfessionalCount >= subscriptionProfessionalLimit || currentLocationCount >= subscriptionLocationLimit) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">Subscription Limit Reached</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-800">
              You&apos;re using all available slots in your current subscription. Add professional or
              location add-ons from Usage & Billing before adding more records.
            </p>
            <div className="flex flex-wrap gap-2">
              {currentProfessionalCount >= subscriptionProfessionalLimit && onAddProfessionals && (
                <Button variant="default" className="bg-amber-600 hover:bg-amber-700" onClick={onAddProfessionals}>
                  Add professional add-on
                </Button>
              )}
              {currentLocationCount >= subscriptionLocationLimit && onAddLocations && (
                <Button variant="outline" onClick={onAddLocations}>
                  Add location add-on
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
