"use client";

import React, { Suspense, lazy, ComponentType } from 'react';
import FullPageLoader from './FullPageLoader';

interface LazyRouteProps {
  factory: () => Promise<{ default: ComponentType<any> }>;
}

const LazyRoute: React.FC<LazyRouteProps> = ({ factory }) => {
  const LazyComponent = lazy(factory);
  
  return (
    <Suspense fallback={<FullPageLoader />}>
      <LazyComponent />
    </Suspense>
  );
};

export default LazyRoute;