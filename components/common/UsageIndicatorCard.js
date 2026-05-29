"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function UsageIndicatorCard({
  title,
  icon: Icon,
  currentUsage,
  limit,
  price,
  onAddMore,
  description,
}) {
  const percentage = (currentUsage / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isExceeded = currentUsage >= limit;

  return (
    <Card className={isExceeded ? "border-red-300 bg-red-50" : isNearLimit ? "border-yellow-300 bg-yellow-50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">
              {currentUsage}/{limit} used
            </span>
          </div>
          <Progress value={Math.min(percentage, 100)} className="h-2" />
          {isExceeded && (
            <p className="text-xs text-red-600 mt-2">
              ⚠️ You've exceeded your plan limit
            </p>
          )}
          {isNearLimit && !isExceeded && (
            <p className="text-xs text-yellow-600 mt-2">
              ⚠️ You're nearing your limit
            </p>
          )}
        </div>
        {onAddMore && (
          <Button
            size="sm"
            variant={isExceeded || isNearLimit ? "default" : "outline"}
            onClick={onAddMore}
            className="w-full"
          >
            Add More {title}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
