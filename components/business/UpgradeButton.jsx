'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function UpgradeButton({
  vendor,
  isCompact = false,
  showWarning = false
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!vendor) return null;

  const handleUpgrade = () => {
    setIsLoading(true);
    router.push('/business/upgrade');
  };

  return (
    <div className="flex flex-col gap-2">
      {showWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          Your subscription expires on {new Date(vendor.subscriptionExpiresAt).toLocaleDateString()}
        </div>
      )}
      <Button
        onClick={handleUpgrade}
        disabled={isLoading}
        className={isCompact ? 'w-full' : ''}
        variant={showWarning ? 'destructive' : 'default'}
      >
        {isLoading ? 'Loading...' : 'Upgrade Plan'}
      </Button>
    </div>
  );
}
