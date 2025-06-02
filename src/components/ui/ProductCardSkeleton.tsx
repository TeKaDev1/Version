import React from 'react';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming you have a Skeleton component

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="group relative bg-background rounded-xl overflow-hidden border border-border/20">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-end gap-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;